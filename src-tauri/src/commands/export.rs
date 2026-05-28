use std::fs::{self, File};
use std::io::{Read, Write};
use std::path::Path;

use zip::read::ZipArchive;
use zip::write::SimpleFileOptions;
use zip::ZipWriter;

use crate::locations::{save_dir, screen_set_dir};
use crate::widget::screen_set::ScreenSet;

fn zip_directory(dir: &Path, zip_path: &Path) -> Result<(), String> {
    let file = File::create(zip_path).map_err(|e| format!("Failed to create zip: {e}"))?;
    let mut zip = ZipWriter::new(file);
    let options = SimpleFileOptions::default().compression_method(zip::CompressionMethod::Deflated);

    add_dir_to_zip(&mut zip, dir, dir, options)?;

    zip.finish().map_err(|e| format!("Failed to finalize zip: {e}"))?;
    Ok(())
}

fn add_dir_to_zip(
    zip: &mut ZipWriter<File>,
    base: &Path,
    current: &Path,
    options: SimpleFileOptions,
) -> Result<(), String> {
    let entries = fs::read_dir(current).map_err(|e| format!("Failed to read dir: {e}"))?;
    for entry in entries.flatten() {
        let path = entry.path();
        let relative = path.strip_prefix(base).unwrap();
        let name = relative.to_string_lossy().replace('\\', "/");

        if path.is_dir() {
            zip.add_directory(&format!("{name}/"), options)
                .map_err(|e| format!("Failed to add directory to zip: {e}"))?;
            add_dir_to_zip(zip, base, &path, options)?;
        } else {
            zip.start_file(&name, options)
                .map_err(|e| format!("Failed to start file in zip: {e}"))?;
            let mut f = File::open(&path).map_err(|e| format!("Failed to open file: {e}"))?;
            let mut buf = Vec::new();
            f.read_to_end(&mut buf).map_err(|e| format!("Failed to read file: {e}"))?;
            zip.write_all(&buf).map_err(|e| format!("Failed to write to zip: {e}"))?;
        }
    }
    Ok(())
}

#[tauri::command]
pub async fn import_screen_set() -> Result<Option<String>, String> {
    let file = rfd::AsyncFileDialog::new()
        .add_filter("Zip Archive", &["zip"])
        .pick_file()
        .await;

    let src = match file {
        Some(handle) => handle.path().to_path_buf(),
        None => return Ok(None),
    };

    let zip_file = File::open(&src).map_err(|e| format!("Failed to open zip: {e}"))?;
    let mut archive = ZipArchive::new(zip_file).map_err(|e| format!("Invalid zip file: {e}"))?;

    let layout_contents = {
        let mut layout_file = archive.by_name("layout.json")
            .map_err(|_| "Zip does not contain a layout.json - not a valid screen set export".to_string())?;
        let mut contents = String::new();
        layout_file.read_to_string(&mut contents)
            .map_err(|e| format!("Failed to read layout.json: {e}"))?;
        contents
    };

    let screen_set: ScreenSet = serde_json::from_str(&layout_contents)
        .map_err(|e| format!("Invalid layout.json: {e}"))?;

    let dest_dir = save_dir().join(&screen_set.id);
    if dest_dir.exists() {
        return Err(format!("A screen set with id '{}' already exists", screen_set.id));
    }

    fs::create_dir_all(&dest_dir).map_err(|e| format!("Failed to create directory: {e}"))?;

    for i in 0..archive.len() {
        let mut entry = archive.by_index(i).map_err(|e| format!("Failed to read zip entry: {e}"))?;
        let Some(path) = entry.enclosed_name().map(|p| p.to_path_buf()) else {
            continue;
        };
        let out_path = dest_dir.join(&path);

        if entry.is_dir() {
            fs::create_dir_all(&out_path).map_err(|e| format!("Failed to create dir: {e}"))?;
        } else {
            if let Some(parent) = out_path.parent() {
                fs::create_dir_all(parent).map_err(|e| format!("Failed to create dir: {e}"))?;
            }
            let mut out_file = File::create(&out_path).map_err(|e| format!("Failed to create file: {e}"))?;
            std::io::copy(&mut entry, &mut out_file).map_err(|e| format!("Failed to extract file: {e}"))?;
        }
    }

    Ok(Some(screen_set.id))
}

#[tauri::command]
pub async fn export_screen_set(id: String, name: String) -> Result<(), String> {
    let dir = screen_set_dir(&id);
    if !dir.exists() {
        return Err("Screen set not found".to_string());
    }

    let save_dialog = rfd::AsyncFileDialog::new()
        .set_file_name(format!("{name}.zip"))
        .add_filter("Zip Archive", &["zip"])
        .save_file()
        .await;

    let dest = match save_dialog {
        Some(handle) => handle.path().to_path_buf(),
        None => return Ok(()),
    };

    zip_directory(&dir, &dest)
}

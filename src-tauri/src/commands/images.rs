use std::fs;
use std::path::PathBuf;
use crate::locations::screen_set_images_dir;
use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub struct ImageEntry {
    pub file: String,
}

#[tauri::command]
pub async fn import_image(screen_set_id: String, path: Option<String>) -> Result<String, String> {
    let src = if let Some(p) = path {
        PathBuf::from(p)
    } else {
        let file = rfd::AsyncFileDialog::new()
            .add_filter("Images", &["png", "jpg", "jpeg", "gif", "webp", "svg"])
            .pick_file()
            .await
            .ok_or("No file selected")?;
        file.path().to_path_buf()
    };
    let filename = src
        .file_name()
        .ok_or("Invalid file path")?
        .to_string_lossy()
        .to_string();
    let dest_dir = screen_set_images_dir(&screen_set_id);
    fs::create_dir_all(&dest_dir).map_err(|e| format!("Failed to create images dir: {}", e))?;
    let dest = dest_dir.join(&filename);
    fs::copy(&src, &dest).map_err(|e| format!("Failed to copy image: {}", e))?;
    Ok(filename)
}

#[tauri::command]
pub async fn list_images(screen_set_id: String) -> Vec<ImageEntry> {
    let mut entries = Vec::new();
    let dir = screen_set_images_dir(&screen_set_id);
    if let Ok(dir) = fs::read_dir(dir) {
        for entry in dir.flatten() {
            let path = entry.path();
            if path.is_file() {
                if let Some(ext) = path.extension() {
                    let ext = ext.to_string_lossy().to_lowercase();
                    if matches!(ext.as_str(), "png" | "jpg" | "jpeg" | "gif" | "webp" | "svg") {
                        entries.push(ImageEntry {
                            file: entry.file_name().to_string_lossy().to_string(),
                        });
                    }
                }
            }
        }
    }
    entries
}

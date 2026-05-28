use std::fs;
use std::io::BufReader;
use crate::locations::screen_set_sounds_dir;
use crate::mobile_assets::AudioEntry;
use rodio::{Decoder, DeviceSinkBuilder, Source};

#[tauri::command]
pub async fn preview_sound(screen_set_id: String, source: String, file: String, volume: f32) -> Result<(), String> {
    tokio::task::spawn_blocking(move || {
        let sink = DeviceSinkBuilder::open_default_sink()
            .map_err(|e| format!("No audio device: {}", e))?;

        match source.as_str() {
            "resources" => {
                #[cfg(debug_assertions)]
                {
                    let path = std::path::PathBuf::from(format!("{}/{}", env!("CARGO_MANIFEST_DIR"), "../sfx")).join(&file);
                    let f = fs::File::open(&path).map_err(|e| format!("Failed to open: {}", e))?;
                    let src = Decoder::new(BufReader::new(f)).map_err(|e| format!("Failed to decode: {}", e))?;
                    sink.mixer().add(src.amplify(volume));
                }
                #[cfg(not(debug_assertions))]
                {
                    use std::io::Cursor;
                    use include_dir::{include_dir, Dir};
                    static AUDIO_ASSETS: Dir = include_dir!("$CARGO_MANIFEST_DIR/../sfx");
                    if let Some(entry) = AUDIO_ASSETS.get_file(&file) {
                        let cursor = Cursor::new(entry.contents().to_vec());
                        let src = Decoder::new(cursor).map_err(|e| format!("Failed to decode: {}", e))?;
                        sink.mixer().add(src.amplify(volume));
                    } else {
                        return Err(format!("Resource not found: {}", file));
                    }
                }
            }
            _ => {
                let path = screen_set_sounds_dir(&screen_set_id).join(&file);
                let f = fs::File::open(&path).map_err(|e| format!("Failed to open: {}", e))?;
                let src = Decoder::new(BufReader::new(f)).map_err(|e| format!("Failed to decode: {}", e))?;
                sink.mixer().add(src.amplify(volume));
            }
        }

        std::thread::sleep(std::time::Duration::from_secs(3));
        Ok(())
    }).await.map_err(|e| format!("Task failed: {}", e))?
}

#[tauri::command]
pub async fn get_audio_clips(screen_set_id: String) -> Vec<AudioEntry> {
    let mut clips: Vec<AudioEntry> = Vec::new();

    // Get user sounds from screen set's sounds directory
    let sounds_dir = screen_set_sounds_dir(&screen_set_id);
    if let Ok(sound_dir_entries) = fs::read_dir(sounds_dir) {
        for entry in sound_dir_entries {
            if let Ok(entry) = entry {
                let path = entry.path();
                if path.is_file() {
                    let filename = entry.file_name();
                    clips.push(AudioEntry {
                        source: "sounds".to_string(),
                        file: filename.to_string_lossy().to_string(),
                    });
                }
            }
        }
    }

    // Get bundled audio resources from sfx directory
    #[cfg(debug_assertions)]
    {
        let disk_path = format!("{}/{}", env!("CARGO_MANIFEST_DIR"), "../sfx");
        if let Ok(disk_entries) = fs::read_dir(disk_path) {
            for entry in disk_entries {
                if let Ok(entry) = entry {
                    let path = entry.path();
                    if path.is_file() {
                        let filename = entry.file_name();
                        clips.push(AudioEntry {
                            source: "resources".to_string(),
                            file: filename.to_string_lossy().to_string(),
                        });
                    }
                }
            }
        }
    }

    #[cfg(not(debug_assertions))]
    {
        use include_dir::{include_dir, Dir};
        static AUDIO_ASSETS: Dir = include_dir!("$CARGO_MANIFEST_DIR/../sfx");

        for entry in AUDIO_ASSETS.entries() {
            let path = entry.path();
            if path.is_file() {
                if let Some(filename) = path.file_name() {
                    clips.push(AudioEntry {
                        source: "resources".to_string(),
                        file: filename.to_string_lossy().to_string(),
                    });
                }
            }
        }
    }

    clips
}

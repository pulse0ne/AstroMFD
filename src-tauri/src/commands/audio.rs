use std::fs;
use crate::locations::sounds_dir;
use crate::mobile_assets::AudioEntry;

#[tauri::command]
pub async fn get_audio_clips() -> Vec<AudioEntry> {
    let mut clips: Vec<AudioEntry> = Vec::new();

    // Get user sounds from sounds directory
    if let Ok(sound_dir_entries) = fs::read_dir(sounds_dir()) {
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

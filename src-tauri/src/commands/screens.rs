use std::fs;
use std::fs::File;
use log::{debug, error};
use serde::Serialize;
use crate::locations::save_dir;
use crate::widget::screen_set::{Screen, ScreenSet, ScreenSize};

#[derive(Serialize, Clone)]
pub struct ScreenSetMeta {
    pub id: String,
    pub name: String,
}

#[tauri::command]
pub async fn list_screen_sets() -> Result<Vec<ScreenSetMeta>, String> {
    match fs::read_dir(save_dir()) {
        Ok(entries) => {
            let screen_sets = entries.into_iter().map(|entry| {
                // TODO: error handling
                let screen_set: ScreenSet = serde_json::from_reader(File::open(entry.unwrap().path()).unwrap()).unwrap();
                ScreenSetMeta { id: screen_set.id, name: screen_set.name }
            }).collect();
            Ok(screen_sets)
        }
        Err(e) => {
            error!("Failed to list screen sets: {}", e.to_string());
            Err(e.to_string())
        }
    }
}

#[tauri::command]
pub async fn get_screen_set_by_id(id: String) -> Result<ScreenSet, String> {
    debug!("loading screen set {}", id);
    // let screen_set = ScreenSet {
    //     id,
    //     name: "Test".to_string(),
    //     screens: vec!(
    //         Screen {
    //             id: "123".to_string(),
    //             name: "TestScreen".to_string(),
    //             background_color: "black".to_string(),
    //             widgets: vec![],
    //         }
    //     ),
    //     size: ScreenSize { width: 1200, height: 800 }
    // };
    // Ok(screen_set)

    // TODO: error handling
    let file_path = save_dir().join(format!("{}.json", id));
    let screen_set = serde_json::from_reader(File::open(file_path).unwrap()).unwrap();
    Ok(screen_set)
}

#[tauri::command]
pub async fn save_screen_set(screen_set: ScreenSet) -> Result<(), String> {
    debug!("Saving screen set {} (id: {})", screen_set.name, screen_set.id);
    match serde_json::to_string(&screen_set) {
        Ok(json_string) => {
            let file_path = save_dir().join(format!("{}.json", screen_set.id));
            if let Ok(_) = fs::write(file_path.clone(), json_string) {
                Ok(())
            } else {
                let msg = format!("Failed to write file {}", file_path.to_string_lossy());
                error!("{}", msg);
                Err(msg)
            }
        },
        Err(e) => {
            error!("Failed to serialize screen set {}: {}", screen_set.id, e.to_string());
            Err(e.to_string())
        }
    }
}

#[tauri::command]
pub async fn delete_screen_set(id: String) -> Result<(), String> {
    // TODO
    Ok(())
}

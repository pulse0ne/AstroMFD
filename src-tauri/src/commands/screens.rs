use std::fs;
use std::fs::File;
use std::io::BufReader;
use log::debug;
use serde::Serialize;
use crate::locations::save_dir;
use crate::state::{AppState, ServerEvent};
use crate::widget::screen_set::ScreenSet;

#[derive(Serialize, Clone)]
pub struct ScreenSetMeta {
    pub id: String,
    pub name: String,
}

#[tauri::command]
pub async fn list_screen_sets() -> Result<Vec<ScreenSetMeta>, String> {
    let entries = fs::read_dir(save_dir())
        .map_err(|e| format!("Failed to list screen sets: {e}"))?;

    let mut screen_sets = Vec::new();

    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read entry: {e}"))?;
        let path = entry.path();

        if !path.is_file() || path.extension().and_then(|ext| ext.to_str()) != Some("json") {
            continue;
        }

        let file = File::open(&path)
            .map_err(|e| format!("Failed to open {:?}: {e}", path))?;

        let reader = BufReader::new(file);

        let screen_set: ScreenSet = serde_json::from_reader(reader)
            .map_err(|e| format!("Failed to deserialize {:?}: {e}", path))?;

        screen_sets.push(ScreenSetMeta {
            id: screen_set.id,
            name: screen_set.name,
        });
    }

    Ok(screen_sets)
}

#[tauri::command]
pub async fn get_screen_set_by_id(id: String) -> Result<ScreenSet, String> {
    debug!("loading screen set {}", id);
    let file_path = save_dir().join(format!("{id}.json"));
    let file = File::open(&file_path)
        .map_err(|e| format!("Failed to open {:?}: {e}", file_path))?;

    let reader = BufReader::new(file);
    let screen_set = serde_json::from_reader(reader)
        .map_err(|e| format!("Failed to deserialize {:?}: {e}", file_path))?;

    Ok(screen_set)
}

#[tauri::command]
pub async fn save_screen_set(screen_set: ScreenSet) -> Result<(), String> {
    debug!("Saving screen set {} (id: {})", screen_set.name, screen_set.id);
    let json = serde_json::to_string_pretty(&screen_set)
        .map_err(|e| format!("Failed to serialize screen set {}: {e}", screen_set.id))?;

    let file_path = save_dir().join(format!("{}.json", screen_set.id));
    fs::write(&file_path, json)
        .map_err(|e| format!("Failed to write {:?}: {e}", file_path))?;

    Ok(())
}

#[tauri::command]
pub async fn update_clients(state: tauri::State<'_, AppState>, screen_set: ScreenSet) -> Result<(), String> {
    debug!("Updating clients");
    let ws_sender = state.server_tx.clone();
    let id = screen_set.id.clone();

    if ws_sender.receiver_count() > 0 {
        let _ = ws_sender
            .send(ServerEvent::LayoutPushed { id, screen_set })
            .map_err(|e| format!("Failed to send LayoutPushed event: {e}"))?;
    }
    Ok(())
}

#[tauri::command]
pub async fn delete_screen_set(id: String) -> Result<(), String> {
    let file_path = save_dir().join(format!("{}.json", id));
    fs::remove_file(&file_path)
        .map_err(|e| format!("Failed to delete file {:?}: {e}", file_path))?;
    Ok(())
}

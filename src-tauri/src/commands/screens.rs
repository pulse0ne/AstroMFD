use std::fs;
use std::fs::File;
use std::io::BufReader;
use log::debug;
use serde::Serialize;
use uuid::Uuid;
use crate::locations::save_dir;
use crate::state::{AppState, ServerEvent};
use crate::widget::screen_set::{Screen, ScreenSet, ScreenSize};

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ScreenSetMeta {
    pub id: String,
    pub name: String,
    pub screen_img_id: Option<String>,
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
        
        let img_id = screen_set.screens.first().map(|s| s.id.clone());

        screen_sets.push(ScreenSetMeta {
            id: screen_set.id,
            name: screen_set.name,
            screen_img_id: img_id,
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
pub async fn delete_screen_set(id: String) -> Result<Vec<ScreenSetMeta>, String> {
    let file_path = save_dir().join(format!("{}.json", id));
    fs::remove_file(&file_path)
        .map_err(|e| format!("Failed to delete file {:?}: {e}", file_path))?;
    list_screen_sets().await
}

#[tauri::command]
pub async fn rename_screen_set(id: String, name: String) -> Result<Vec<ScreenSetMeta>, String> {
    let mut screen_set = get_screen_set_by_id(id.clone()).await?;
    screen_set.name = name;
    save_screen_set(screen_set).await?;
    list_screen_sets().await
}

#[tauri::command]
pub async fn create_screen_set(name: String) -> Result<ScreenSet, String> {
    let screen_set = ScreenSet {
        id: Uuid::new_v4().to_string(),
        name,
        screens: vec![
            Screen {
                id: Uuid::new_v4().to_string(),
                name: "Untitled Screen 1".to_string(),
                widgets: vec![],
                background_color: "black".to_string(),
            }
        ],
        size: ScreenSize { width: 1200, height: 800 },
    };
    save_screen_set(screen_set.clone()).await?;
    Ok(screen_set)
}

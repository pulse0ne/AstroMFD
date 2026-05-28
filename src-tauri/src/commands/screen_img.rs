use std::fs;
use log::debug;
use serde::Serialize;
use tauri::{AppHandle, Emitter};
use tauri::ipc::Response;

#[derive(Serialize, Clone)]
struct ImageUpdatedMessage {
    id: String,
}

#[tauri::command]
pub async fn save_screen_img(id: String, data: Vec<u8>, app_handle: AppHandle) -> Result<(), String> {
    debug!("saving screen img for {}", id);
    let file_path = dirs::data_local_dir()
        .unwrap_or_default()
        .join("AstroMFD")
        .join("thumbs")
        .join(format!("{}.png", id));
    if let Err(e) = fs::write(file_path, data) {
        return Err(e.to_string());
    };
    if let Err(e) = app_handle.emit("screen-image-updated", ImageUpdatedMessage { id }) {
        return Err(e.to_string());
    };
    Ok(())
}

#[tauri::command]
pub async fn get_screen_img(id: String) -> Result<Response, String> {
    debug!("loading screen img for {}", id);
    let file_path = dirs::data_local_dir()
        .unwrap_or_default()
        .join("AstroMFD")
        .join("thumbs")
        .join(format!("{}.png", id));
    match fs::read(file_path) {
        Ok(data) => {
            Ok(Response::new(data))
        }
        Err(e) => {
            Err(e.to_string())
        }
    }
}

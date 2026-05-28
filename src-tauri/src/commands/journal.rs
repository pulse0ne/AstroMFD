use std::path::PathBuf;
use crate::journal::{JournalHandle, detect_elite_dangerous_journal_path};
use crate::state::AppState;
use log::debug;

#[tauri::command]
pub fn get_default_journal_path() -> Result<Option<String>, String> {
    let path = detect_elite_dangerous_journal_path();

    if let Some(ref p) = path {
        debug!("Detected Elite Dangerous journal path: {}", p);
    } else {
        debug!("Could not detect Elite Dangerous journal path");
    }

    Ok(path)
}

#[tauri::command]
pub async fn set_journal_path(state: tauri::State<'_, AppState>, path: Option<String>) -> Result<(), String> {
    let mut journal_opt = state.journal.lock().await;

    // stop if running
    if let Some(handle) = journal_opt.as_mut() {
        handle.stop();
        *journal_opt = None;
    }

    // if a path is provided, restart
    if let Some(path) = path {
        let handle = JournalHandle::start(PathBuf::from(path),state.server_tx.clone())
            .await
            .map_err(|e| e.to_string())?;
        *journal_opt = Some(handle);
    }

    Ok(())
}

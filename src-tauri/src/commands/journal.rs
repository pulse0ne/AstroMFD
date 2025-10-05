use std::path::PathBuf;
use crate::journal::JournalHandle;
use crate::state::AppState;

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

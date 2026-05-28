use local_ip_address::local_ip;
use tauri::State;
use crate::state::AppState;

#[tauri::command]
pub async fn get_mobile_client_server_address(state: State<'_, AppState>) -> Result<String, String> {
    let ip = local_ip().map_err(|e| e.to_string())?;
    Ok(format!("{}:{}", ip, state.port))
}

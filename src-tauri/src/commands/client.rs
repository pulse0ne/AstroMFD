use local_ip_address::local_ip;

#[tauri::command]
pub async fn get_mobile_client_server_address() -> String {
    local_ip().unwrap().to_string()
}

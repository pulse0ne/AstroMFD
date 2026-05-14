use crate::input::{self, InputKey};

#[tauri::command]
pub fn get_available_input_keys() -> Result<Vec<InputKey>, String> {
    Ok(input::platform_available_keys())
}

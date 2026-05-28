use crate::input::{self, InputKey, JoystickAxis};

#[tauri::command]
pub fn get_available_input_keys() -> Result<Vec<InputKey>, String> {
    Ok(input::platform_available_keys())
}

#[tauri::command]
pub fn get_available_axes() -> Result<Vec<JoystickAxis>, String> {
    Ok(JoystickAxis::all().to_vec())
}

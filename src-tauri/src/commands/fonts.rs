use crate::fonts;

#[tauri::command]
pub async fn list_system_fonts() -> Vec<fonts::FontSpec> {
    fonts::list_fonts()
}
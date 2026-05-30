use crate::fonts;

#[tauri::command]
pub async fn list_fonts() -> Vec<fonts::FontEntry> {
    fonts::list_fonts()
}

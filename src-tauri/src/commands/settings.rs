use serde::Serialize;
use crate::settings::Settings;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SettingsResponse {
    #[serde(flatten)]
    pub settings: Settings,
    pub platform: &'static str,
}

#[tauri::command]
pub async fn get_settings() -> SettingsResponse {
    SettingsResponse {
        settings: Settings::load(),
        platform: std::env::consts::OS,
    }
}

#[tauri::command]
pub async fn save_settings(settings: Settings) -> Result<(), String> {
    settings.save()
}

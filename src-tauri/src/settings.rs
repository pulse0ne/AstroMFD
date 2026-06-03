use std::fs;
use serde::{Deserialize, Serialize};
use crate::locations::ec_root;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Settings {
    #[serde(default = "default_port")]
    pub port: u16,
    #[serde(default)]
    pub journal_path: Option<String>,
    #[serde(default = "default_vjoy_device_id")]
    pub vjoy_device_id: u8,
}

fn default_port() -> u16 { 11011 }
fn default_vjoy_device_id() -> u8 { 1 }

impl Default for Settings {
    fn default() -> Self {
        Self {
            port: default_port(),
            journal_path: None,
            vjoy_device_id: default_vjoy_device_id(),
        }
    }
}

impl Settings {
    pub fn load() -> Self {
        let path = ec_root().join("settings.json");
        if path.exists() {
            match fs::read_to_string(&path) {
                Ok(contents) => serde_json::from_str(&contents).unwrap_or_default(),
                Err(_) => Self::default(),
            }
        } else {
            Self::default()
        }
    }

    pub fn save(&self) -> Result<(), String> {
        if self.port < 1024 || self.port == 0 {
            return Err("Port must be between 1024 and 65535".to_string());
        }
        if self.vjoy_device_id < 1 || self.vjoy_device_id > 16 {
            return Err("VJoy device ID must be between 1 and 16".to_string());
        }
        let path = ec_root().join("settings.json");
        let json = serde_json::to_string_pretty(self)
            .map_err(|e| format!("Failed to serialize settings: {}", e))?;
        fs::write(&path, json)
            .map_err(|e| format!("Failed to write settings: {}", e))?;
        Ok(())
    }
}

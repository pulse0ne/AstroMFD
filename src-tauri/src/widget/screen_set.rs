use serde::{Deserialize, Serialize};
use crate::widget::Widget;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScreenSize {
    pub width: u64,
    pub height: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScreenEffects {
    #[serde(default)]
    pub scanlines: bool,
    #[serde(default)]
    pub lcd_grid: bool,
    #[serde(default)]
    pub phosphor_glow: bool,
    #[serde(default)]
    pub vignette: bool,
    #[serde(default)]
    pub flicker: bool,
    #[serde(default)]
    pub chromatic_aberration: bool,
    #[serde(default)]
    pub noise: bool,
}

impl Default for ScreenEffects {
    fn default() -> Self {
        Self {
            scanlines: false,
            lcd_grid: false,
            phosphor_glow: false,
            vignette: false,
            flicker: false,
            chromatic_aberration: false,
            noise: false,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Screen {
    pub id: String,
    pub name: String,
    pub background_color: String,
    pub widgets: Vec<Widget>,
    #[serde(default)]
    pub crt_effect: bool,
    #[serde(default)]
    pub effects: ScreenEffects,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ScreenSet {
    pub id: String,
    pub name: String,
    pub size: ScreenSize,
    pub screens: Vec<Screen>,
}

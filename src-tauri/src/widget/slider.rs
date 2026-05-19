use serde::{Deserialize, Serialize};
use crate::input::JoystickAxis;
use crate::widget::base::{TextAttributes, WidgetBase};

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum SliderOrientation {
    #[default]
    Horizontal,
    Vertical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SliderAppearance {
    pub track_color: String,
    pub active_color: String,
    pub thumb_color: String,
    pub track_thickness: f64,
    pub thumb_size: f64,
}

impl Default for SliderAppearance {
    fn default() -> Self {
        Self {
            track_color: "#1a2a3a".to_string(),
            active_color: "#3a6a8a".to_string(),
            thumb_color: "#5a9aba".to_string(),
            track_thickness: 4.0,
            thumb_size: 10.0,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SliderAction {
    pub axis: JoystickAxis,
    pub min: f64,
    pub max: f64,
}

impl Default for SliderAction {
    fn default() -> Self {
        Self {
            axis: JoystickAxis::X,
            min: 0.0,
            max: 1.0,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SliderAttributes {
    #[serde(flatten)]
    pub widget: WidgetBase,
    pub orientation: SliderOrientation,
    #[serde(default)]
    pub appearance: SliderAppearance,
    pub axis: SliderAction,
    pub text: TextAttributes,
}

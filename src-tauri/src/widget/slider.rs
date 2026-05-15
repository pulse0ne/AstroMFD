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
    pub axis: SliderAction,
    pub text: TextAttributes,
}

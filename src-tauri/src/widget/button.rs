use serde::{Deserialize, Serialize};
use crate::widget::base::{ShapeAttributes, TextAttributes, WidgetBase};

#[derive(Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum ButtonType {
    #[default]
    Action,
    Toggle,
    Navigation,
}

#[derive(Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PressedOverrides {
    pub shape: ShapeAttributes, // TODO: how to support partial? new types?
    pub text: TextAttributes,
}

#[derive(Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ButtonAttributes {
    #[serde(flatten)]
    pub widget: WidgetBase,
    pub button_type: ButtonType,
    pub vjoy_button: u8,
    // TODO: duration?
    pub nav_target: Option<String>,
    pub text: TextAttributes,
    pub pressed: PressedOverrides,
}

use serde::{Deserialize, Serialize};
use crate::widget::base::{FontSpec, HorizontalAlignment, Position, Size, TextAttributes, VerticalAlignment, WidgetBase};

#[derive(Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PartialShapeAttributes {
    pub fill: Option<String>,
    pub stroke: Option<String>,
    pub stroke_width: Option<f64>,
    pub corner_radius: Option<f64>,
    pub size: Option<Size>,
    pub position: Option<Position>,
}

#[derive(Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PartialTextAttributes {
    pub text: Option<String>,
    pub font: Option<FontSpec>,
    pub font_size: Option<f64>,
    pub font_color: Option<String>,
    pub horizontal_alignment: Option<HorizontalAlignment>,
    pub vertical_alignment: Option<VerticalAlignment>,
}

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
    pub shape: PartialShapeAttributes,
    pub text: PartialTextAttributes,
}

#[derive(Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VJoyButtonConfig {
    pub button: u8,
    pub duration: u64,
}

#[derive(Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ButtonAttributes {
    #[serde(flatten)]
    pub widget: WidgetBase,
    pub button_type: ButtonType,
    pub vjoy_button: VJoyButtonConfig,
    pub nav_target: Option<String>,
    pub text: TextAttributes,
    pub pressed: PressedOverrides,
}

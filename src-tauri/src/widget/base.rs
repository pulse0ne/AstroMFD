use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GradientStop {
    pub id: String,
    pub color: String,
    pub position: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum Gradient {
    Linear { stops: Vec<GradientStop> },
    Radial { stops: Vec<GradientStop> },
}

impl Default for Gradient {
    fn default() -> Self {
        Gradient::Linear { stops: vec![] }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "value", rename_all = "camelCase")]
pub enum Color {
    Solid(String),
    Gradient(Gradient),
}

impl Default for Color {
    fn default() -> Self {
        Color::Solid("transparent".to_string())
    }
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum VerticalAlignment {
    Top,
    #[default]
    Middle,
    Bottom,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum HorizontalAlignment {
    Left,
    #[default]
    Center,
    Right,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FontSpec {
    pub name: String,
    pub postscript_name: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ShadowEffect {
    pub color: String,
    pub strength: f64,
    pub x_offset: f64,
    pub y_offset: f64,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TextAttributes {
    pub text: Option<String>,
    pub font: Option<FontSpec>,
    pub font_size: f64,
    pub font_color: Option<String>,
    pub shadow: Option<ShadowEffect>,
    pub horizontal_alignment: HorizontalAlignment,
    pub vertical_alignment: VerticalAlignment,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Size {
    pub width: f64,
    pub height: f64,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Position {
    pub x: f64,
    pub y: f64,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SvgXmlNode {
    pub name: String,
    #[serde(rename = "type")]
    pub element_type: String,
    pub value: String,
    pub attributes: HashMap<String, String>,
    pub children: Vec<SvgXmlNode>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ShapeAttributes {
    pub svg: Option<SvgXmlNode>,
    pub fill: Option<Color>,
    pub stroke: Option<String>,
    pub stroke_width: f64,
    pub corner_radius: f64,
    pub shadow: Option<ShadowEffect>,
    pub size: Size,
    pub position: Position,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WidgetBase {
    pub id: String,
    pub shape: ShapeAttributes,
}

use serde::{Deserialize, Serialize};
use crate::widget::base::{Color, FontSpec, HorizontalAlignment, Position, ShadowEffect, Size, SvgXmlNode, TextAttributes, VerticalAlignment, WidgetBase};
use crate::input::InputKey;

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PartialShapeAttributes {
    pub svg: Option<SvgXmlNode>,
    pub fill: Option<Color>,
    pub stroke: Option<String>,
    pub stroke_width: Option<f64>,
    pub corner_radius: Option<f64>,
    pub shadow: Option<ShadowEffect>,
    pub size: Option<Size>,
    pub position: Option<Position>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PartialTextAttributes {
    pub text: Option<String>,
    pub font: Option<FontSpec>,
    pub font_size: Option<f64>,
    pub font_color: Option<String>,
    pub shadow: Option<ShadowEffect>,
    pub horizontal_alignment: Option<HorizontalAlignment>,
    pub vertical_alignment: Option<VerticalAlignment>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum ButtonType {
    #[default]
    Action,
    Toggle,
    Navigation,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PressedOverrides {
    pub shape: PartialShapeAttributes,
    pub text: PartialTextAttributes,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ButtonAction {
    pub key: InputKey,
    pub fixed_duration: bool,
    pub duration: u64,
}

// Custom deserializer to handle legacy format
impl<'de> Deserialize<'de> for ButtonAction {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        #[derive(Deserialize)]
        #[serde(rename_all = "camelCase")]
        struct LegacyButtonAction {
            #[serde(default)]
            button: Option<u8>,
            #[serde(default)]
            key: Option<InputKey>,
            fixed_duration: bool,
            duration: u64,
        }

        let legacy = LegacyButtonAction::deserialize(deserializer)?;

        // If key exists, use it (new format)
        // Otherwise, migrate from button number (old format)
        let key = match (legacy.key, legacy.button) {
            (Some(key), _) => key,
            (None, Some(button)) => InputKey::JoystickButton { button },
            (None, None) => InputKey::JoystickButton { button: 1 }, // Default fallback
        };

        Ok(ButtonAction {
            key,
            fixed_duration: legacy.fixed_duration,
            duration: legacy.duration,
        })
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ButtonAttributes {
    #[serde(flatten)]
    pub widget: WidgetBase,
    pub button_type: ButtonType,
    #[serde(alias = "vjoyButton")] // Support old format
    pub input: ButtonAction,
    pub nav_target: Option<String>,
    pub text: TextAttributes,
    pub pressed: PressedOverrides,
}

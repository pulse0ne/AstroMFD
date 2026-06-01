use serde::{Deserialize, Serialize};
use crate::widget::base::{Color, FontSpec, HorizontalAlignment, Position, ShadowEffect, Size, SvgXmlNode, TextAttributes, VerticalAlignment, WidgetBase, WidgetIcon};
use crate::input::{ActionStep, InputKey};

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
    Exit,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PressedOverrides {
    pub shape: PartialShapeAttributes,
    pub text: PartialTextAttributes,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ActionSequence {
    pub steps: Vec<ActionStep>,
}

impl<'de> Deserialize<'de> for ActionSequence {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        let value = serde_json::Value::deserialize(deserializer)
            .map_err(serde::de::Error::custom)?;

        // New format: { "steps": [...] }
        if let Some(steps_val) = value.get("steps") {
            let steps: Vec<ActionStep> = serde_json::from_value(steps_val.clone())
                .map_err(serde::de::Error::custom)?;
            return Ok(ActionSequence { steps });
        }

        // Legacy format: { "key": {...}, "fixedDuration": bool, "duration": u64 }
        // or even older: { "button": u8, "fixedDuration": bool, "duration": u64 }
        let key = if let Some(key_val) = value.get("key") {
            serde_json::from_value::<InputKey>(key_val.clone())
                .map_err(serde::de::Error::custom)?
        } else if let Some(button) = value.get("button").and_then(|v| v.as_u64()) {
            InputKey::JoystickButton { button: button as u8 }
        } else {
            InputKey::JoystickButton { button: 1 }
        };

        let duration = value.get("duration")
            .and_then(|v| v.as_u64())
            .unwrap_or(100);

        let step = ActionStep::Press { key, duration };
        Ok(ActionSequence { steps: vec![step] })
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ButtonAttributes {
    #[serde(flatten)]
    pub widget: WidgetBase,
    pub button_type: ButtonType,
    #[serde(alias = "vjoyButton")]
    pub input: ActionSequence,
    pub nav_target: Option<String>,
    pub text: TextAttributes,
    #[serde(default)]
    pub icon: Option<WidgetIcon>,
    pub pressed: PressedOverrides,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn deserialize_new_format() {
        let json = r#"{
            "steps": [
                { "type": "press", "key": { "type": "joystickButton", "button": 5 }, "duration": 200 },
                { "type": "pause", "duration": 50 },
                { "type": "keyDown", "key": { "type": "letter", "key": "A" } }
            ]
        }"#;
        let seq: ActionSequence = serde_json::from_str(json).unwrap();
        assert_eq!(seq.steps.len(), 3);
        assert_eq!(seq.steps[0], ActionStep::Press {
            key: InputKey::JoystickButton { button: 5 },
            duration: 200,
        });
        assert_eq!(seq.steps[1], ActionStep::Pause { duration: 50 });
        assert_eq!(seq.steps[2], ActionStep::KeyDown {
            key: InputKey::Letter { key: 'A' },
        });
    }

    #[test]
    fn deserialize_legacy_key_format() {
        let json = r#"{
            "key": { "type": "joystickButton", "button": 3 },
            "fixedDuration": true,
            "duration": 150
        }"#;
        let seq: ActionSequence = serde_json::from_str(json).unwrap();
        assert_eq!(seq.steps.len(), 1);
        assert_eq!(seq.steps[0], ActionStep::Press {
            key: InputKey::JoystickButton { button: 3 },
            duration: 150,
        });
    }

    #[test]
    fn deserialize_legacy_button_format() {
        let json = r#"{
            "button": 7,
            "fixedDuration": false,
            "duration": 100
        }"#;
        let seq: ActionSequence = serde_json::from_str(json).unwrap();
        assert_eq!(seq.steps.len(), 1);
        assert_eq!(seq.steps[0], ActionStep::Press {
            key: InputKey::JoystickButton { button: 7 },
            duration: 100,
        });
    }

    #[test]
    fn deserialize_legacy_no_key_no_button_defaults() {
        let json = r#"{ "fixedDuration": true }"#;
        let seq: ActionSequence = serde_json::from_str(json).unwrap();
        assert_eq!(seq.steps.len(), 1);
        assert_eq!(seq.steps[0], ActionStep::Press {
            key: InputKey::JoystickButton { button: 1 },
            duration: 100,
        });
    }

    #[test]
    fn serialize_roundtrip() {
        let seq = ActionSequence {
            steps: vec![
                ActionStep::Press { key: InputKey::Letter { key: 'X' }, duration: 50 },
                ActionStep::Pause { duration: 200 },
                ActionStep::KeyUp { key: InputKey::SpecialKey { key: crate::input::SpecialKey::Space } },
            ],
        };
        let json = serde_json::to_string(&seq).unwrap();
        let parsed: serde_json::Value = serde_json::from_str(&json).unwrap();
        assert!(parsed.get("steps").unwrap().is_array());
        assert_eq!(parsed["steps"].as_array().unwrap().len(), 3);
    }
}

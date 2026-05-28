use std::net::IpAddr;
use std::sync::Arc;
use serde::{Deserialize, Serialize};
use tokio::sync::{broadcast, mpsc, Mutex};
use crate::journal::JournalHandle;
use crate::widget::screen_set::ScreenSet;
use crate::input::{ActionStep, InputKey, JoystickAxis};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub enum ServerEvent {
    #[serde(rename_all = "camelCase")]
    LayoutPushed { id: String, screen_set: ScreenSet },
    #[serde(rename_all = "camelCase")]
    AllJournalEntries { entries: Vec<String> },
    #[serde(rename_all = "camelCase")]
    NewJournalEntries { entries: Vec<String> },
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub enum MobileEvent {
    KeyDown { key: InputKey },
    KeyUp { key: InputKey },
    FixedPress { key: InputKey, duration: u64 },
    AxisMove { axis: JoystickAxis, value: f64 },
    #[serde(rename_all = "camelCase")]
    ExecuteActions { screen_set_id: String, steps: Vec<ActionStep> },
    ClientReport { width: u64, height: u64, device: String },
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct MobileClient {
    pub ip_addr: IpAddr,
    pub viewport_width: u64,
    pub viewport_height: u64,
    pub device_type: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn deserialize_key_down() {
        let json = r#"{"keyDown":{"key":{"type":"joystickButton","button":1}}}"#;
        let evt: MobileEvent = serde_json::from_str(json).unwrap();
        assert!(matches!(evt, MobileEvent::KeyDown { key: InputKey::JoystickButton { button: 1 } }));
    }

    #[test]
    fn deserialize_key_up() {
        let json = r#"{"keyUp":{"key":{"type":"letter","key":"Z"}}}"#;
        let evt: MobileEvent = serde_json::from_str(json).unwrap();
        assert!(matches!(evt, MobileEvent::KeyUp { key: InputKey::Letter { key: 'Z' } }));
    }

    #[test]
    fn deserialize_fixed_press() {
        let json = r#"{"fixedPress":{"key":{"type":"functionKey","key":12},"duration":500}}"#;
        let evt: MobileEvent = serde_json::from_str(json).unwrap();
        match evt {
            MobileEvent::FixedPress { key, duration } => {
                assert_eq!(key, InputKey::FunctionKey { key: 12 });
                assert_eq!(duration, 500);
            }
            _ => panic!("wrong variant"),
        }
    }

    #[test]
    fn deserialize_axis_move() {
        let json = r#"{"axisMove":{"axis":"x","value":0.75}}"#;
        let evt: MobileEvent = serde_json::from_str(json).unwrap();
        match evt {
            MobileEvent::AxisMove { axis, value } => {
                assert_eq!(axis, JoystickAxis::X);
                assert!((value - 0.75).abs() < f64::EPSILON);
            }
            _ => panic!("wrong variant"),
        }
    }

    #[test]
    fn deserialize_execute_actions() {
        let json = r#"{"executeActions":{"screenSetId":"abc-123","steps":[{"type":"press","key":{"type":"joystickButton","button":2},"duration":100},{"type":"pause","duration":50}]}}"#;
        let evt: MobileEvent = serde_json::from_str(json).unwrap();
        match evt {
            MobileEvent::ExecuteActions { screen_set_id, steps } => {
                assert_eq!(screen_set_id, "abc-123");
                assert_eq!(steps.len(), 2);
                assert_eq!(steps[0], ActionStep::Press {
                    key: InputKey::JoystickButton { button: 2 },
                    duration: 100,
                });
                assert_eq!(steps[1], ActionStep::Pause { duration: 50 });
            }
            _ => panic!("wrong variant"),
        }
    }

    #[test]
    fn deserialize_client_report() {
        let json = r#"{"clientReport":{"width":1920,"height":1080,"device":"iPhone 15"}}"#;
        let evt: MobileEvent = serde_json::from_str(json).unwrap();
        match evt {
            MobileEvent::ClientReport { width, height, device } => {
                assert_eq!(width, 1920);
                assert_eq!(height, 1080);
                assert_eq!(device, "iPhone 15");
            }
            _ => panic!("wrong variant"),
        }
    }

    #[test]
    fn serialize_server_event_roundtrip() {
        let evt = ServerEvent::AllJournalEntries {
            entries: vec!["line1".into(), "line2".into()],
        };
        let json = serde_json::to_string(&evt).unwrap();
        let parsed: ServerEvent = serde_json::from_str(&json).unwrap();
        match parsed {
            ServerEvent::AllJournalEntries { entries } => {
                assert_eq!(entries, vec!["line1", "line2"]);
            }
            _ => panic!("wrong variant"),
        }
    }
}

#[derive(Clone)]
pub struct AppState {
    pub mobile_tx: mpsc::Sender<MobileEvent>,
    pub server_tx: broadcast::Sender<ServerEvent>,
    pub app_handle: tauri::AppHandle,
    pub mobile_clients: Arc<Mutex<Vec<MobileClient>>>,
    pub journal: Arc<Mutex<Option<JournalHandle>>>,
    pub port: u16,
}

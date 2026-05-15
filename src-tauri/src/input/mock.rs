use log::info;
use crate::input::{self, InputDevice, InputKey, JoystickAxis};

pub struct MockDevice;

#[async_trait::async_trait]
impl InputDevice for MockDevice {
    async fn press_key(&mut self, key: &InputKey, duration_millis: u64) {
        info!("[MOCK] press_key({:?}, {})", key, duration_millis);
    }

    async fn key_down(&mut self, key: &InputKey) {
        info!("[MOCK] key_down({:?})", key);
    }

    async fn key_up(&mut self, key: &InputKey) {
        info!("[MOCK] key_up({:?})", key);
    }

    async fn set_axis(&mut self, axis: JoystickAxis, value: f64) {
        info!("[MOCK] set_axis({:?}, {})", axis, value);
    }

    fn available_keys(&self) -> Vec<InputKey> {
        input::platform_available_keys()
    }

    fn available_axes(&self) -> Vec<JoystickAxis> {
        JoystickAxis::all().to_vec()
    }

    fn device_info(&self) -> String {
        "Mock Input Device".to_string()
    }
}

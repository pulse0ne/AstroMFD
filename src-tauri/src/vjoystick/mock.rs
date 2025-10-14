use log::info;
use crate::vjoystick::{InputDevice, VJoyDeviceConfig};

pub struct MockDevice;

#[async_trait::async_trait]
impl InputDevice for MockDevice {
    async fn press_button(&mut self, button: u8, duration_millis: u64) {
        info!("[MOCK] press_button({}, {})", button, duration_millis);
    }

    async fn button_down(&mut self, button: u8) {
        info!("[MOCK] button_down({})", button);
    }

    async fn button_up(&mut self, button: u8) {
        info!("[MOCK] button_up({})", button);
    }
    
    async fn query_devices(&self) -> Vec<VJoyDeviceConfig> {
        info!("[MOCK] query_devices()");
        vec![
            VJoyDeviceConfig { id: 1, buttons: 64 },
            VJoyDeviceConfig { id: 2, buttons: 128 },
        ]
    }
}
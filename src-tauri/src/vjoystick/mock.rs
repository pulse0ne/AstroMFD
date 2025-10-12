use log::info;
use crate::vjoystick::InputDevice;

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
}
use log::debug;
use vjoy::{ButtonState, VJoy};
use crate::vjoystick::{InputDevice, VJoyDeviceConfig};

pub struct VJoyDevice {
    pub vjoy: VJoy,
    pub device_id: u32,
}

#[async_trait::async_trait]
impl InputDevice for VJoyDevice {
    async fn press_button(&mut self, button: u8, duration_millis: u64) {
        debug!("Press button {} with duration {}", button, duration_millis);
        let mut device = self.vjoy.get_device_state(self.device_id).unwrap();
        device.set_button(button, ButtonState::Pressed).unwrap();
        self.vjoy.update_device_state(&device).unwrap();

        tokio::time::sleep(std::time::Duration::from_millis(duration_millis)).await;

        device.set_button(button, ButtonState::Released).unwrap();
        self.vjoy.update_device_state(&device).unwrap();
    }
    
    async fn button_down(&mut self, button: u8) {
        debug!("Button down: {}", button);
        let mut device = self.vjoy.get_device_state(self.device_id).unwrap();
        device.set_button(button, ButtonState::Pressed).unwrap();
        self.vjoy.update_device_state(&device).unwrap();
    }

    async fn button_up(&mut self, button: u8) {
        debug!("Button up: {}", button);
        let mut device = self.vjoy.get_device_state(self.device_id).unwrap();
        device.set_button(button, ButtonState::Released).unwrap();
        self.vjoy.update_device_state(&device).unwrap();
    }

    async fn query_devices(&self) -> Vec<VJoyDeviceConfig> {
        debug!("Querying vjoy devices");
        self.vjoy.devices_cloned().map(|d| {
            VJoyDeviceConfig {
                id: d.id(),
                buttons: d.num_buttons(),
            }
        }).collect()
    }
}

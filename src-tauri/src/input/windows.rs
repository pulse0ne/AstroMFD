use log::debug;
use vjoy::{ButtonState, VJoy};
use crate::vjoystick::{InputDevice, InputKey};

pub struct VJoyDevice {
    pub vjoy: VJoy,
    pub device_id: u32,
}

#[async_trait::async_trait]
impl InputDevice for VJoyDevice {
    async fn press_key(&mut self, key: &InputKey, duration_millis: u64) {
        if let InputKey::JoystickButton { button } = key {
            debug!("Press button {} with duration {}", button, duration_millis);
            let mut device = self.vjoy.get_device_state(self.device_id).unwrap();
            device.set_button(*button, ButtonState::Pressed).unwrap();
            self.vjoy.update_device_state(&device).unwrap();

            tokio::time::sleep(std::time::Duration::from_millis(duration_millis)).await;

            device.set_button(*button, ButtonState::Released).unwrap();
            self.vjoy.update_device_state(&device).unwrap();
        } else {
            debug!("Ignoring non-joystick key: {:?}", key);
        }
    }

    async fn key_down(&mut self, key: &InputKey) {
        if let InputKey::JoystickButton { button } = key {
            debug!("Button down: {}", button);
            let mut device = self.vjoy.get_device_state(self.device_id).unwrap();
            device.set_button(*button, ButtonState::Pressed).unwrap();
            self.vjoy.update_device_state(&device).unwrap();
        } else {
            debug!("Ignoring non-joystick key: {:?}", key);
        }
    }

    async fn key_up(&mut self, key: &InputKey) {
        if let InputKey::JoystickButton { button } = key {
            debug!("Button up: {}", button);
            let mut device = self.vjoy.get_device_state(self.device_id).unwrap();
            device.set_button(*button, ButtonState::Released).unwrap();
            self.vjoy.update_device_state(&device).unwrap();
        } else {
            debug!("Ignoring non-joystick key: {:?}", key);
        }
    }

    fn available_keys(&self) -> Vec<InputKey> {
        debug!("Getting available joystick buttons");
        let device = self.vjoy.get_device_state(self.device_id).unwrap();
        (1..=device.num_buttons() as u8)
            .map(|button| InputKey::JoystickButton { button })
            .collect()
    }

    fn device_info(&self) -> String {
        format!("VJoy Device #{}", self.device_id)
    }
}

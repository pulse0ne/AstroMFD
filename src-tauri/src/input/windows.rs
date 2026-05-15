use log::{debug, warn};
use vjoy::{ButtonState, VJoy};
use crate::input::{InputDevice, InputKey, JoystickAxis};

pub struct VJoyDevice {
    pub vjoy: VJoy,
    pub device_id: u32,
}

#[async_trait::async_trait]
impl InputDevice for VJoyDevice {
    async fn press_key(&mut self, key: &InputKey, duration_millis: u64) {
        if let InputKey::JoystickButton { button } = key {
            debug!("Press button {} with duration {}", button, duration_millis);
            let mut device = match self.vjoy.get_device_state(self.device_id) {
                Ok(d) => d,
                Err(e) => { warn!("Failed to get VJoy device state: {}", e); return; }
            };
            if let Err(e) = device.set_button(*button, ButtonState::Pressed) {
                warn!("Failed to press button {}: {}", button, e);
                return;
            }
            if let Err(e) = self.vjoy.update_device_state(&device) {
                warn!("Failed to update VJoy device state: {}", e);
                return;
            }

            tokio::time::sleep(std::time::Duration::from_millis(duration_millis)).await;

            if let Err(e) = device.set_button(*button, ButtonState::Released) {
                warn!("Failed to release button {}: {}", button, e);
                return;
            }
            if let Err(e) = self.vjoy.update_device_state(&device) {
                warn!("Failed to update VJoy device state: {}", e);
            }
        } else {
            debug!("Ignoring non-joystick key: {:?}", key);
        }
    }

    async fn key_down(&mut self, key: &InputKey) {
        if let InputKey::JoystickButton { button } = key {
            debug!("Button down: {}", button);
            let mut device = match self.vjoy.get_device_state(self.device_id) {
                Ok(d) => d,
                Err(e) => { warn!("Failed to get VJoy device state: {}", e); return; }
            };
            if let Err(e) = device.set_button(*button, ButtonState::Pressed) {
                warn!("Failed to press button {}: {}", button, e);
                return;
            }
            if let Err(e) = self.vjoy.update_device_state(&device) {
                warn!("Failed to update VJoy device state: {}", e);
            }
        } else {
            debug!("Ignoring non-joystick key: {:?}", key);
        }
    }

    async fn key_up(&mut self, key: &InputKey) {
        if let InputKey::JoystickButton { button } = key {
            debug!("Button up: {}", button);
            let mut device = match self.vjoy.get_device_state(self.device_id) {
                Ok(d) => d,
                Err(e) => { warn!("Failed to get VJoy device state: {}", e); return; }
            };
            if let Err(e) = device.set_button(*button, ButtonState::Released) {
                warn!("Failed to release button {}: {}", button, e);
                return;
            }
            if let Err(e) = self.vjoy.update_device_state(&device) {
                warn!("Failed to update VJoy device state: {}", e);
            }
        } else {
            debug!("Ignoring non-joystick key: {:?}", key);
        }
    }

    async fn set_axis(&mut self, axis: JoystickAxis, value: f64) {
        let axis_id = axis_to_vjoy_id(axis);
        let scaled = (value.clamp(0.0, 1.0) * 32767.0) as i32;
        debug!("Set axis {:?} (vjoy id {}) to {} (raw {})", axis, axis_id, value, scaled);
        let mut device = match self.vjoy.get_device_state(self.device_id) {
            Ok(d) => d,
            Err(e) => { warn!("Failed to get VJoy device state: {}", e); return; }
        };
        if let Err(e) = device.set_axis(axis_id, scaled) {
            warn!("Failed to set axis {:?}: {}", axis, e);
            return;
        }
        if let Err(e) = self.vjoy.update_device_state(&device) {
            warn!("Failed to update VJoy device state: {}", e);
        }
    }

    fn available_keys(&self) -> Vec<InputKey> {
        debug!("Getting available joystick buttons");
        match self.vjoy.get_device_state(self.device_id) {
            Ok(device) => {
                (1..=device.num_buttons() as u8)
                    .map(|button| InputKey::JoystickButton { button })
                    .collect()
            }
            Err(e) => {
                warn!("Failed to get VJoy device state: {}", e);
                vec![]
            }
        }
    }

    fn available_axes(&self) -> Vec<JoystickAxis> {
        JoystickAxis::all().to_vec()
    }

    fn device_info(&self) -> String {
        format!("VJoy Device #{}", self.device_id)
    }
}

fn axis_to_vjoy_id(axis: JoystickAxis) -> u32 {
    match axis {
        JoystickAxis::X => 1,
        JoystickAxis::Y => 2,
        JoystickAxis::Z => 3,
        JoystickAxis::Rx => 4,
        JoystickAxis::Ry => 5,
        JoystickAxis::Rz => 6,
        JoystickAxis::Slider1 => 7,
        JoystickAxis::Slider2 => 8,
    }
}

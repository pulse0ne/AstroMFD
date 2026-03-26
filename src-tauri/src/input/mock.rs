use log::info;
use crate::input::{InputDevice, InputKey, SpecialKey};

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

    fn available_keys(&self) -> Vec<InputKey> {
        info!("[MOCK] available_keys()");
        let mut keys = vec![];

        // Add some sample letters
        for c in 'A'..='Z' {
            keys.push(InputKey::Letter { key: c });
        }

        // Add numbers
        for n in 0..=9 {
            keys.push(InputKey::Number { key: n });
        }

        // Add function keys
        for f in 1..=12 {
            keys.push(InputKey::FunctionKey { key: f });
        }

        // Add some special keys
        keys.push(InputKey::SpecialKey { key: SpecialKey::Enter });
        keys.push(InputKey::SpecialKey { key: SpecialKey::Space });
        keys.push(InputKey::SpecialKey { key: SpecialKey::Escape });

        keys
    }

    fn device_info(&self) -> String {
        "[MOCK] Mock Input Device".to_string()
    }
}

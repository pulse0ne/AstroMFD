#[cfg(target_os = "windows")]
mod windows;
#[cfg(target_os = "windows")]
use vjoy::VJoy;
#[cfg(target_os = "windows")]
pub use windows::VJoyDevice;

#[cfg(target_os = "linux")]
mod linux;
#[cfg(target_os = "linux")]
pub use linux::EvdevDevice;

#[cfg(not(any(target_os = "windows", target_os = "linux")))]
mod mock;
#[cfg(not(any(target_os = "windows", target_os = "linux")))]
pub use mock::MockDevice;

use crate::state::{MobileEvent, ServerEvent};
use log::{info, trace};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::{broadcast, mpsc, Mutex};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum InputKey {
    /// Virtual joystick button (Windows/VJoy)
    JoystickButton { button: u8 },

    /// Letter key A-Z (case insensitive)
    Letter { key: char },

    /// Number key 0-9
    Number { key: u8 },

    /// Function key F1-F24
    FunctionKey { key: u8 },

    /// Special keys
    SpecialKey { key: SpecialKey },
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum SpecialKey {
    Enter,
    Space,
    Tab,
    Escape,
    Backspace,
    Delete,
    Home,
    End,
    PageUp,
    PageDown,
    ArrowUp,
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    Shift,
    Ctrl,
    Alt,
    CapsLock,
}

#[async_trait::async_trait]
pub trait InputDevice: Send + Sync {
    /// Press and release a key after the specified duration
    async fn press_key(&mut self, key: &InputKey, duration_millis: u64);

    /// Press a key down (hold)
    async fn key_down(&mut self, key: &InputKey);

    /// Release a key
    async fn key_up(&mut self, key: &InputKey);

    /// Get available input keys for this platform/device
    fn available_keys(&self) -> Vec<InputKey>;

    /// Get device information as a human-readable string
    fn device_info(&self) -> String;
}

pub async fn input_worker(
    mut mobile_rx: mpsc::Receiver<MobileEvent>,
    _server_tx: broadcast::Sender<ServerEvent>,
) {
    let device: Arc<Mutex<dyn InputDevice>> = {
        #[cfg(target_os = "windows")]
        {
            Arc::new(Mutex::new(VJoyDevice {
                vjoy: VJoy::from_default_dll_location().unwrap(),
                device_id: 2,
            }))
        }
        #[cfg(target_os = "linux")]
        {
            match EvdevDevice::new() {
                Ok(dev) => Arc::new(Mutex::new(dev)),
                Err(e) => {
                    log::error!("Failed to create evdev device: {}. Make sure you have permissions to create uinput devices.", e);
                    panic!("Cannot create evdev device");
                }
            }
        }
        #[cfg(not(any(target_os = "windows", target_os = "linux")))]
        {
            Arc::new(Mutex::new(MockDevice))
        }
    };
    info!("Input worker running...");
    while let Some(evt) = mobile_rx.recv().await {
        trace!("Received mobile event: {:?}", evt);
        match evt.clone() {
            MobileEvent::FixedPress { key, duration } => {
                device.lock().await.press_key(&key, duration).await;
            }
            MobileEvent::KeyDown { key } => {
                device.lock().await.key_down(&key).await;
            }
            MobileEvent::KeyUp { key } => {
                device.lock().await.key_up(&key).await;
            }
            _ => {}
        }
        match evt {
            MobileEvent::FixedPress { key: _, duration: _ } | MobileEvent::KeyDown { key: _ } => {
                // TODO: rodio play
            },
            _ => {}
        }
    }
}

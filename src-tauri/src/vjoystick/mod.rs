#[cfg(target_os = "windows")]
mod windows;
#[cfg(target_os = "windows")]
pub use windows::VJoyDevice;
#[cfg(target_os = "windows")]
use vjoy::VJoy;

#[cfg(not(target_os = "windows"))]
mod mock;
#[cfg(not(target_os = "windows"))]
pub use mock::MockDevice;

use std::sync::Arc;
use log::{info, trace};
use tokio::sync::{broadcast, mpsc, Mutex};
use crate::state::{MobileEvent, ServerEvent};

pub struct VJoyDeviceConfig {
    pub id: u32,
    pub buttons: usize,
}

#[cfg_attr(any(target_os = "windows", target_os = "macos"), async_trait::async_trait)]
pub trait InputDevice: Send + Sync {
    async fn press_button(&mut self, button: u8, duration_millis: u64);
    async fn button_down(&mut self, button: u8);
    async fn button_up(&mut self, button: u8);
    async fn query_devices(&self) -> Vec<VJoyDeviceConfig>;
}

pub async fn vjoy_worker(
    mut mobile_rx: mpsc::Receiver<MobileEvent>,
    _server_tx: broadcast::Sender<ServerEvent>
) {
    let device: Arc<Mutex<dyn InputDevice>> = {
        #[cfg(target_os = "windows")]
        {
            Arc::new(Mutex::new(VJoyDeviceConfig { vjoy: VJoy::from_default_dll_location().unwrap(), device_id: 2 }))
        }
        #[cfg(not(target_os = "windows"))]
        {
            Arc::new(Mutex::new(MockDevice))
        }
    };
    info!("vJoy worker running...");
    while let Some(evt) = mobile_rx.recv().await {
        trace!("Received mobile event: {:?}", evt);
        match evt {
            MobileEvent::FixedPress { button, duration } => {
                device.lock().await.press_button(button, duration).await;
            },
            MobileEvent::ButtonDown { button } => {
                device.lock().await.button_down(button).await;
            },
            MobileEvent::ButtonUp { button } => {
                device.lock().await.button_up(button).await;
            },
            _ => {}
        }
    }
}

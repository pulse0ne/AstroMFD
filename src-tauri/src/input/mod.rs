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

use crate::locations::screen_set_sounds_dir;
use crate::state::{MobileEvent, ServerEvent};
use log::{info, trace, warn};
use rodio::{Decoder, DeviceSinkBuilder, MixerDeviceSink};
use rodio::mixer::Mixer;
use serde::{Deserialize, Serialize};
use std::fs::File;
use std::io::BufReader;
#[cfg(not(debug_assertions))]
use std::io::Cursor;
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
    LeftShift,
    RightShift,
    LeftCtrl,
    RightCtrl,
    LeftAlt,
    RightAlt,
    CapsLock,
}

impl SpecialKey {
    #[cfg(target_os = "linux")]
    pub fn all() -> &'static [SpecialKey] {
        &[
            SpecialKey::Enter, SpecialKey::Space, SpecialKey::Tab,
            SpecialKey::Escape, SpecialKey::Backspace, SpecialKey::Delete,
            SpecialKey::Home, SpecialKey::End, SpecialKey::PageUp,
            SpecialKey::PageDown, SpecialKey::ArrowUp, SpecialKey::ArrowDown,
            SpecialKey::ArrowLeft, SpecialKey::ArrowRight,
            SpecialKey::LeftShift, SpecialKey::RightShift,
            SpecialKey::LeftCtrl, SpecialKey::RightCtrl,
            SpecialKey::LeftAlt, SpecialKey::RightAlt,
            SpecialKey::CapsLock,
        ]
    }
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum JoystickAxis {
    X,
    Y,
    Z,
    Rx,
    Ry,
    Rz,
    Slider1,
    Slider2,
}

impl JoystickAxis {
    pub fn all() -> &'static [JoystickAxis] {
        &[
            JoystickAxis::X, JoystickAxis::Y, JoystickAxis::Z,
            JoystickAxis::Rx, JoystickAxis::Ry, JoystickAxis::Rz,
            JoystickAxis::Slider1, JoystickAxis::Slider2,
        ]
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum ActionStep {
    Press { key: InputKey, #[serde(default = "default_press_duration")] duration: u64 },
    KeyDown { key: InputKey },
    KeyUp { key: InputKey },
    Pause { duration: u64 },
    PlaySound { file: String, #[serde(default = "default_sound_source")] source: String, #[serde(default = "default_volume")] volume: f32 },
}

fn default_press_duration() -> u64 { 100 }
fn default_volume() -> f32 { 1.0 }
fn default_sound_source() -> String { "sounds".to_string() }

#[async_trait::async_trait]
pub trait InputDevice: Send + Sync {
    async fn press_key(&mut self, key: &InputKey, duration_millis: u64);
    async fn key_down(&mut self, key: &InputKey);
    async fn key_up(&mut self, key: &InputKey);
    async fn set_axis(&mut self, axis: JoystickAxis, value: f64);
    // fn available_keys(&self) -> Vec<InputKey>;
    // fn available_axes(&self) -> Vec<JoystickAxis>;
    // fn device_info(&self) -> String;
}

pub fn platform_available_keys() -> Vec<InputKey> {
    #[cfg(target_os = "windows")]
    {
        (1..=128u8)
            .map(|button| InputKey::JoystickButton { button })
            .collect()
    }

    #[cfg(target_os = "linux")]
    {
        let mut keys = Vec::new();
        for c in 'A'..='Z' {
            keys.push(InputKey::Letter { key: c });
        }
        for n in 0..=9u8 {
            keys.push(InputKey::Number { key: n });
        }
        for f in 1..=24u8 {
            keys.push(InputKey::FunctionKey { key: f });
        }
        for key in SpecialKey::all() {
            keys.push(InputKey::SpecialKey { key: *key });
        }
        keys
    }

    #[cfg(not(any(target_os = "windows", target_os = "linux")))]
    {
        let mut keys = Vec::new();
        for c in 'A'..='Z' {
            keys.push(InputKey::Letter { key: c });
        }
        for n in 0..=9u8 {
            keys.push(InputKey::Number { key: n });
        }
        for f in 1..=12u8 {
            keys.push(InputKey::FunctionKey { key: f });
        }
        keys.push(InputKey::SpecialKey { key: SpecialKey::Enter });
        keys.push(InputKey::SpecialKey { key: SpecialKey::Space });
        keys.push(InputKey::SpecialKey { key: SpecialKey::Escape });
        keys
    }
}

fn play_sound(mixer: &Mixer, source_type: &str, file: &str, volume: f32, screen_set_id: &str) {
    use rodio::Source;
    match source_type {
        "resources" => {
            #[cfg(not(debug_assertions))]
            {
                if let Some(entry) = crate::mobile_assets::AUDIO_ASSETS.get_file(file) {
                    let cursor = Cursor::new(entry.contents().to_vec());
                    match Decoder::new(cursor) {
                        Ok(src) => mixer.add(src.amplify(volume)),
                        Err(e) => warn!("Failed to decode resource audio {}: {}", file, e),
                    }
                } else {
                    warn!("Resource audio file not found: {}", file);
                }
            }
            #[cfg(debug_assertions)]
            {
                let path = std::path::PathBuf::from(format!("{}/{}", env!("CARGO_MANIFEST_DIR"), "../sfx")).join(file);
                match File::open(&path) {
                    Ok(f) => match Decoder::new(BufReader::new(f)) {
                        Ok(src) => mixer.add(src.amplify(volume)),
                        Err(e) => warn!("Failed to decode audio {}: {}", path.display(), e),
                    },
                    Err(e) => warn!("Failed to open audio {}: {}", path.display(), e),
                }
            }
        }
        _ => {
            let path = screen_set_sounds_dir(screen_set_id).join(file);
            match File::open(&path) {
                Ok(f) => match Decoder::new(BufReader::new(f)) {
                    Ok(src) => mixer.add(src.amplify(volume)),
                    Err(e) => warn!("Failed to decode audio {}: {}", path.display(), e),
                },
                Err(e) => warn!("Failed to open sound file {}: {}", path.display(), e),
            }
        }
    }
}

pub async fn input_worker(
    mut mobile_rx: mpsc::Receiver<MobileEvent>,
    _server_tx: broadcast::Sender<ServerEvent>,
    vjoy_device_id: u8,
) {
    let device: Arc<Mutex<dyn InputDevice>> = {
        #[cfg(target_os = "windows")]
        {
            Arc::new(Mutex::new(VJoyDevice {
                vjoy: VJoy::from_default_dll_location().unwrap(),
                device_id: vjoy_device_id as u32,
            }))
        }
        #[cfg(target_os = "linux")]
        {
            let _ = vjoy_device_id;
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
            let _ = vjoy_device_id;
            Arc::new(Mutex::new(MockDevice))
        }
    };

    let audio_device: Option<Arc<MixerDeviceSink>> = match DeviceSinkBuilder::open_default_sink() {
        Ok(sink) => Some(Arc::new(sink)),
        Err(e) => {
            warn!("No audio output available: {}. Sound playback disabled.", e);
            None
        }
    };

    info!("Input worker running...");
    while let Some(evt) = mobile_rx.recv().await {
        trace!("Received mobile event: {:?}", evt);
        match evt {
            MobileEvent::FixedPress { ref key, duration } => {
                device.lock().await.press_key(key, duration).await;
            }
            MobileEvent::KeyDown { ref key } => {
                device.lock().await.key_down(key).await;
            }
            MobileEvent::KeyUp { ref key } => {
                device.lock().await.key_up(key).await;
            }
            MobileEvent::AxisMove { axis, value } => {
                device.lock().await.set_axis(axis, value).await;
            }
            MobileEvent::ExecuteActions { screen_set_id, steps } => {
                let device = device.clone();
                let audio_device = audio_device.clone();
                tokio::spawn(async move {
                    for step in steps {
                        match step {
                            ActionStep::Press { ref key, duration } => {
                                device.lock().await.press_key(key, duration).await;
                            }
                            ActionStep::KeyDown { ref key } => {
                                device.lock().await.key_down(key).await;
                            }
                            ActionStep::KeyUp { ref key } => {
                                device.lock().await.key_up(key).await;
                            }
                            ActionStep::Pause { duration } => {
                                tokio::time::sleep(std::time::Duration::from_millis(duration)).await;
                            }
                            ActionStep::PlaySound { ref file, ref source, volume } => {
                                if let Some(ref dev) = audio_device {
                                    play_sound(dev.mixer(), source, file, volume, &screen_set_id);
                                }
                            }
                        }
                    }
                });
            }
            _ => {}
        }
    }
}

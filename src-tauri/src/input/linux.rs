use crate::input::{InputDevice, InputKey, SpecialKey};
use evdev::{uinput::VirtualDeviceBuilder, AttributeSet, EventType, InputEvent, Key};
use log::{debug, info, warn};
use std::io;

pub struct EvdevDevice {
    device: evdev::uinput::VirtualDevice,
}

impl EvdevDevice {
    pub fn new() -> io::Result<Self> {
        info!("Creating virtual keyboard device with evdev");

        let mut keys = AttributeSet::<Key>::new();

        // Add all letter keys
        for c in b'A'..=b'Z' {
            if let Some(key) = char_to_evdev_key(char::from(c)) {
                keys.insert(key);
            }
        }

        // Add all number keys
        for n in 0..=9 {
            if let Some(key) = number_to_evdev_key(n) {
                keys.insert(key);
            }
        }

        // Add all function keys F1-F24
        for f in 1..=24 {
            if let Some(key) = function_key_to_evdev(f) {
                keys.insert(key);
            }
        }

        // Add special keys
        keys.insert(Key::KEY_ENTER);
        keys.insert(Key::KEY_SPACE);
        keys.insert(Key::KEY_TAB);
        keys.insert(Key::KEY_ESC);
        keys.insert(Key::KEY_BACKSPACE);
        keys.insert(Key::KEY_DELETE);
        keys.insert(Key::KEY_HOME);
        keys.insert(Key::KEY_END);
        keys.insert(Key::KEY_PAGEUP);
        keys.insert(Key::KEY_PAGEDOWN);
        keys.insert(Key::KEY_UP);
        keys.insert(Key::KEY_DOWN);
        keys.insert(Key::KEY_LEFT);
        keys.insert(Key::KEY_RIGHT);
        keys.insert(Key::KEY_LEFTSHIFT);
        keys.insert(Key::KEY_RIGHTSHIFT);
        keys.insert(Key::KEY_LEFTCTRL);
        keys.insert(Key::KEY_RIGHTCTRL);
        keys.insert(Key::KEY_LEFTALT);
        keys.insert(Key::KEY_RIGHTALT);
        keys.insert(Key::KEY_CAPSLOCK);

        let device = VirtualDeviceBuilder::new()?
            .name("Elite Control Virtual Keyboard")
            .with_keys(&keys)?
            .build()?;

        info!("Virtual keyboard device created successfully");

        Ok(Self { device })
    }

    fn emit_key(&mut self, key: Key, value: i32) -> io::Result<()> {
        let events = [InputEvent::new(EventType::KEY, key.code(), value)];
        self.device.emit(&events)?;
        Ok(())
    }
}

#[async_trait::async_trait]
impl InputDevice for EvdevDevice {
    async fn press_key(&mut self, key: &InputKey, duration_millis: u64) {
        if let Some(evdev_key) = input_key_to_evdev(key) {
            debug!("Press key {:?} with duration {}", key, duration_millis);

            if let Err(e) = self.emit_key(evdev_key, 1) {
                warn!("Failed to press key: {}", e);
                return;
            }

            tokio::time::sleep(std::time::Duration::from_millis(duration_millis)).await;

            if let Err(e) = self.emit_key(evdev_key, 0) {
                warn!("Failed to release key: {}", e);
            }
        } else {
            warn!("Unsupported key: {:?}", key);
        }
    }

    async fn key_down(&mut self, key: &InputKey) {
        if let Some(evdev_key) = input_key_to_evdev(key) {
            debug!("Key down: {:?}", key);
            if let Err(e) = self.emit_key(evdev_key, 1) {
                warn!("Failed to press key down: {}", e);
            }
        } else {
            warn!("Unsupported key: {:?}", key);
        }
    }

    async fn key_up(&mut self, key: &InputKey) {
        if let Some(evdev_key) = input_key_to_evdev(key) {
            debug!("Key up: {:?}", key);
            if let Err(e) = self.emit_key(evdev_key, 0) {
                warn!("Failed to release key: {}", e);
            }
        } else {
            warn!("Unsupported key: {:?}", key);
        }
    }

    fn available_keys(&self) -> Vec<InputKey> {
        let mut keys = vec![];

        // Add letters A-Z
        for c in 'A'..='Z' {
            keys.push(InputKey::Letter { key: c });
        }

        // Add numbers 0-9
        for n in 0..=9 {
            keys.push(InputKey::Number { key: n });
        }

        // Add function keys F1-F24
        for f in 1..=24 {
            keys.push(InputKey::FunctionKey { key: f });
        }

        // Add special keys
        keys.push(InputKey::SpecialKey {
            key: SpecialKey::Enter,
        });
        keys.push(InputKey::SpecialKey {
            key: SpecialKey::Space,
        });
        keys.push(InputKey::SpecialKey {
            key: SpecialKey::Tab,
        });
        keys.push(InputKey::SpecialKey {
            key: SpecialKey::Escape,
        });
        keys.push(InputKey::SpecialKey {
            key: SpecialKey::Backspace,
        });
        keys.push(InputKey::SpecialKey {
            key: SpecialKey::Delete,
        });
        keys.push(InputKey::SpecialKey {
            key: SpecialKey::Home,
        });
        keys.push(InputKey::SpecialKey {
            key: SpecialKey::End,
        });
        keys.push(InputKey::SpecialKey {
            key: SpecialKey::PageUp,
        });
        keys.push(InputKey::SpecialKey {
            key: SpecialKey::PageDown,
        });
        keys.push(InputKey::SpecialKey {
            key: SpecialKey::ArrowUp,
        });
        keys.push(InputKey::SpecialKey {
            key: SpecialKey::ArrowDown,
        });
        keys.push(InputKey::SpecialKey {
            key: SpecialKey::ArrowLeft,
        });
        keys.push(InputKey::SpecialKey {
            key: SpecialKey::ArrowRight,
        });
        keys.push(InputKey::SpecialKey {
            key: SpecialKey::Shift,
        });
        keys.push(InputKey::SpecialKey {
            key: SpecialKey::Ctrl,
        });
        keys.push(InputKey::SpecialKey {
            key: SpecialKey::Alt,
        });
        keys.push(InputKey::SpecialKey {
            key: SpecialKey::CapsLock,
        });

        keys
    }

    fn device_info(&self) -> String {
        "Elite Control Virtual Keyboard (evdev)".to_string()
    }
}

fn input_key_to_evdev(key: &InputKey) -> Option<Key> {
    match key {
        InputKey::Letter { key } => char_to_evdev_key(*key),
        InputKey::Number { key } => number_to_evdev_key(*key),
        InputKey::FunctionKey { key } => function_key_to_evdev(*key),
        InputKey::SpecialKey { key } => special_key_to_evdev(*key),
        InputKey::JoystickButton { .. } => None, // Not supported on Linux
    }
}

fn char_to_evdev_key(c: char) -> Option<Key> {
    let c = c.to_ascii_uppercase();
    match c {
        'A' => Some(Key::KEY_A),
        'B' => Some(Key::KEY_B),
        'C' => Some(Key::KEY_C),
        'D' => Some(Key::KEY_D),
        'E' => Some(Key::KEY_E),
        'F' => Some(Key::KEY_F),
        'G' => Some(Key::KEY_G),
        'H' => Some(Key::KEY_H),
        'I' => Some(Key::KEY_I),
        'J' => Some(Key::KEY_J),
        'K' => Some(Key::KEY_K),
        'L' => Some(Key::KEY_L),
        'M' => Some(Key::KEY_M),
        'N' => Some(Key::KEY_N),
        'O' => Some(Key::KEY_O),
        'P' => Some(Key::KEY_P),
        'Q' => Some(Key::KEY_Q),
        'R' => Some(Key::KEY_R),
        'S' => Some(Key::KEY_S),
        'T' => Some(Key::KEY_T),
        'U' => Some(Key::KEY_U),
        'V' => Some(Key::KEY_V),
        'W' => Some(Key::KEY_W),
        'X' => Some(Key::KEY_X),
        'Y' => Some(Key::KEY_Y),
        'Z' => Some(Key::KEY_Z),
        _ => None,
    }
}

fn number_to_evdev_key(n: u8) -> Option<Key> {
    match n {
        0 => Some(Key::KEY_0),
        1 => Some(Key::KEY_1),
        2 => Some(Key::KEY_2),
        3 => Some(Key::KEY_3),
        4 => Some(Key::KEY_4),
        5 => Some(Key::KEY_5),
        6 => Some(Key::KEY_6),
        7 => Some(Key::KEY_7),
        8 => Some(Key::KEY_8),
        9 => Some(Key::KEY_9),
        _ => None,
    }
}

fn function_key_to_evdev(f: u8) -> Option<Key> {
    match f {
        1 => Some(Key::KEY_F1),
        2 => Some(Key::KEY_F2),
        3 => Some(Key::KEY_F3),
        4 => Some(Key::KEY_F4),
        5 => Some(Key::KEY_F5),
        6 => Some(Key::KEY_F6),
        7 => Some(Key::KEY_F7),
        8 => Some(Key::KEY_F8),
        9 => Some(Key::KEY_F9),
        10 => Some(Key::KEY_F10),
        11 => Some(Key::KEY_F11),
        12 => Some(Key::KEY_F12),
        13 => Some(Key::KEY_F13),
        14 => Some(Key::KEY_F14),
        15 => Some(Key::KEY_F15),
        16 => Some(Key::KEY_F16),
        17 => Some(Key::KEY_F17),
        18 => Some(Key::KEY_F18),
        19 => Some(Key::KEY_F19),
        20 => Some(Key::KEY_F20),
        21 => Some(Key::KEY_F21),
        22 => Some(Key::KEY_F22),
        23 => Some(Key::KEY_F23),
        24 => Some(Key::KEY_F24),
        _ => None,
    }
}

fn special_key_to_evdev(key: SpecialKey) -> Option<Key> {
    match key {
        SpecialKey::Enter => Some(Key::KEY_ENTER),
        SpecialKey::Space => Some(Key::KEY_SPACE),
        SpecialKey::Tab => Some(Key::KEY_TAB),
        SpecialKey::Escape => Some(Key::KEY_ESC),
        SpecialKey::Backspace => Some(Key::KEY_BACKSPACE),
        SpecialKey::Delete => Some(Key::KEY_DELETE),
        SpecialKey::Home => Some(Key::KEY_HOME),
        SpecialKey::End => Some(Key::KEY_END),
        SpecialKey::PageUp => Some(Key::KEY_PAGEUP),
        SpecialKey::PageDown => Some(Key::KEY_PAGEDOWN),
        SpecialKey::ArrowUp => Some(Key::KEY_UP),
        SpecialKey::ArrowDown => Some(Key::KEY_DOWN),
        SpecialKey::ArrowLeft => Some(Key::KEY_LEFT),
        SpecialKey::ArrowRight => Some(Key::KEY_RIGHT),
        SpecialKey::Shift => Some(Key::KEY_LEFTSHIFT),
        SpecialKey::Ctrl => Some(Key::KEY_LEFTCTRL),
        SpecialKey::Alt => Some(Key::KEY_LEFTALT),
        SpecialKey::CapsLock => Some(Key::KEY_CAPSLOCK),
    }
}

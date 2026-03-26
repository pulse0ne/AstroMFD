use crate::input::{InputKey, SpecialKey};

#[tauri::command]
pub fn get_available_input_keys() -> Result<Vec<InputKey>, String> {
    Ok(get_platform_available_keys())
}

/// Returns available input keys for the current platform
fn get_platform_available_keys() -> Vec<InputKey> {
    #[cfg(target_os = "windows")]
    {
        // Windows: Virtual joystick buttons
        (1..=128)
            .map(|button| InputKey::JoystickButton { button })
            .collect()
    }

    #[cfg(target_os = "linux")]
    {
        // Linux: Keyboard keys via evdev
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
        keys.push(InputKey::SpecialKey { key: SpecialKey::Enter });
        keys.push(InputKey::SpecialKey { key: SpecialKey::Space });
        keys.push(InputKey::SpecialKey { key: SpecialKey::Tab });
        keys.push(InputKey::SpecialKey { key: SpecialKey::Escape });
        keys.push(InputKey::SpecialKey { key: SpecialKey::Backspace });
        keys.push(InputKey::SpecialKey { key: SpecialKey::Delete });
        keys.push(InputKey::SpecialKey { key: SpecialKey::Home });
        keys.push(InputKey::SpecialKey { key: SpecialKey::End });
        keys.push(InputKey::SpecialKey { key: SpecialKey::PageUp });
        keys.push(InputKey::SpecialKey { key: SpecialKey::PageDown });
        keys.push(InputKey::SpecialKey { key: SpecialKey::ArrowUp });
        keys.push(InputKey::SpecialKey { key: SpecialKey::ArrowDown });
        keys.push(InputKey::SpecialKey { key: SpecialKey::ArrowLeft });
        keys.push(InputKey::SpecialKey { key: SpecialKey::ArrowRight });
        keys.push(InputKey::SpecialKey { key: SpecialKey::Shift });
        keys.push(InputKey::SpecialKey { key: SpecialKey::Ctrl });
        keys.push(InputKey::SpecialKey { key: SpecialKey::Alt });
        keys.push(InputKey::SpecialKey { key: SpecialKey::CapsLock });

        keys
    }

    #[cfg(not(any(target_os = "windows", target_os = "linux")))]
    {
        // Mock: return a sample of different key types
        let mut keys = vec![];

        for c in 'A'..='Z' {
            keys.push(InputKey::Letter { key: c });
        }

        for n in 0..=9 {
            keys.push(InputKey::Number { key: n });
        }

        for f in 1..=12 {
            keys.push(InputKey::FunctionKey { key: f });
        }

        keys.push(InputKey::SpecialKey { key: SpecialKey::Enter });
        keys.push(InputKey::SpecialKey { key: SpecialKey::Space });
        keys.push(InputKey::SpecialKey { key: SpecialKey::Escape });

        keys
    }
}

use std::fs;

fn main() {
    let capabilities_path = "capabilities/default.json";

    let permissions = if cfg!(feature = "updater") {
        r#"["core:default", "opener:default", "updater:default", "process:allow-restart"]"#
    } else {
        r#"["core:default", "opener:default"]"#
    };

    let content = format!(
        r#"{{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Capability for the main window",
  "windows": ["main"],
  "permissions": {}
}}
"#,
        permissions
    );

    fs::write(capabilities_path, content).expect("Failed to write capabilities");

    tauri_build::build()
}

# AstroMFD

## Development
`tauri dev`

## Dependency Descriptions

### Rust
- tauri: UI driver
- serde: serialization
- tokio: async
- include_dir: package files into binary
- axum: mobile-client webserver
- mime_guess: guess mime type based on extension
- async-trait: enable async functions in trait defs
- local-ip-address: get local IP for QR Code connection
- font-kit: dynamic font loading
- notify: directory/file watching (Elite Dangerous Journal)
- anyhow: error type conversions
- log4rs: logging (file, console, app)
- chrono: time
- log: facade for logging
- regex: regex
- dirs: common directory locations

### Typescript
- react: UI framework
- react-colorful: color picker
- react-dom: mount React app in DOM
- react-icons: Icon pack
- react-konva: React bindings to konva
- react-router: basic routing
- reactjs-popup: menus/popups/modals
- @tauri-apps/api: tauri connections
- konva: canvas drawing library
- qrcode: generate QR codes
- uuid: generate UUIDs
- zustand: state management
- immer: zustand middleware for proxying state changes

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

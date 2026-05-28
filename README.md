# AstroMFD

An open-source, configurable multi-function display (MFD) panel builder for space sims and flight games. Design custom button layouts on your desktop, then use any phone or tablet as a touch-screen control panel over your local network.

Built with [Tauri](https://tauri.app), React, and Rust.

## Features

- **Visual drag-and-drop editor** - place buttons, sliders, labels, panels, carousels, and images on a canvas with snap guides and alignment tools
- **Action sequences** - bind multi-step macros to a single button press (key combos, delays, sounds)
- **Mobile client** - any device with a browser becomes a control panel (served over your local network)
- **Screen effects** - scanlines, LCD grid, phosphor glow, vignette, flicker, chromatic aberration, noise
- **Elite Dangerous integration** - journal file watching with live status events
- **Input backends** - VJoy (Windows), evdev virtual device (Linux)
- **Auto-update** - checks GitHub Releases on startup and prompts to install

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [Rust](https://www.rust-lang.org/tools/install) (stable)
- [Tauri CLI prerequisites](https://v2.tauri.app/start/prerequisites/) for your platform

### Development

```bash
yarn install
yarn tauri dev
```

This starts both the Vite dev server (frontend hot-reload) and the Tauri backend.

### Building

```bash
yarn tauri build
```

Produces platform-specific installers in `src-tauri/target/release/bundle/`.

## Architecture

```
AstroMFD/
├── src/                  # Desktop editor (React + Konva)
├── mobile-client/        # Mobile touch client (React, served via HTTP)
├── shared/               # Shared TypeScript types
├── src-tauri/            # Rust backend
│   └── src/
│       ├── commands/     # Tauri IPC commands
│       ├── input/        # Input device abstraction (VJoy/evdev/mock)
│       ├── journal/      # Elite Dangerous journal watcher
│       ├── widget/       # Widget/screen model + serialization
│       └── lib.rs        # App setup, axum server, plugin registration
└── sfx/                  # Bundled sound effects
```

### How it works

1. The desktop app runs an HTTP + WebSocket server on a configurable port (default 11011)
2. Mobile devices connect via browser to `http://<your-ip>:<port>`
3. Button presses on the mobile client are sent over WebSocket
4. The Rust backend translates them into virtual joystick inputs or keyboard events

## Configuration

Settings are accessible via the gear icon on the home screen:

| Setting | Description | Default |
|---------|-------------|---------|
| Mobile Client Port | Port the mobile server listens on | 11011 |
| Journal Path | Elite Dangerous journal directory | Auto-detect |
| VJoy Device ID | Virtual joystick device number (Windows only) | 2 |

Settings are stored in `~/.local/share/AstroMFD/settings.json` (Linux/macOS) or the equivalent `AppData/Local` path on Windows. Changes require an app restart.

## Releasing

Releases are built via GitHub Actions when a version tag is pushed:

```bash
# Bump version in tauri.conf.json and package.json, then:
git tag v0.2.0
git push origin v0.2.0
```

The workflow builds for macOS (ARM + Intel), Windows, and Linux, then creates a draft GitHub Release. Review and publish to make it available to the auto-updater.

## Building without auto-update

To build a standalone version that never phones home for updates, remove the updater configuration before building:

1. In `src-tauri/tauri.conf.json`, delete the `"plugins"` section and remove `"createUpdaterArtifacts": true` from `"bundle"`.

2. In `src-tauri/src/lib.rs`, remove the `.plugin(tauri_plugin_updater::Builder::new().build())` line.

3. In `src/App.tsx`, remove the `<UpdateChecker />` component and its import.

4. Build normally:

```bash
yarn tauri build
```

## Development Notes

### Dependency Descriptions

**Rust:**
- `tauri` - app framework, IPC, window management
- `axum` - HTTP/WebSocket server for the mobile client
- `tokio` - async runtime
- `rodio` - audio playback for action sounds
- `serde` / `serde_json` - serialization
- `font-kit` - system font enumeration
- `notify` - filesystem watching (journal)
- `rfd` - native file dialogs
- `local-ip-address` - LAN IP for QR code display
- `tauri-plugin-updater` - auto-update from GitHub Releases
- `vjoy` (Windows) - virtual joystick driver
- `evdev` (Linux) - virtual input device

**TypeScript:**
- `react` + `react-dom` - UI framework
- `react-konva` / `konva` - canvas editor
- `zustand` + `immer` - state management with undo/redo
- `react-colorful` - color picker
- `react-icons` - icon pack
- `reactjs-popup` - modals and menus
- `qrcode` - QR code generation for mobile connection
- `@tauri-apps/plugin-updater` - update check + install from frontend

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

OR

- [Zed](https://zed.dev/)

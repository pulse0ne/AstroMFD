# Contributing to AstroMFD

## Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [Yarn](https://classic.yarnpkg.com/) (v1)
- [Rust](https://rustup.rs/) (stable)
- Platform dependencies for Tauri:
  - **macOS:** Xcode Command Line Tools
  - **Linux:** `sudo apt install libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf libdbus-1-dev`
  - **Windows:** WebView2 (pre-installed on Windows 10/11), Visual Studio Build Tools

## Project Structure

```
AstroMFD/
├── src/                  # Desktop editor (React + Konva)
├── src-tauri/            # Tauri backend (Rust)
├── mobile-client/        # Mobile web client (React)
├── shared/               # Shared TypeScript types
└── .github/workflows/    # CI/CD
```

The project uses Yarn workspaces with three packages: `src`, `mobile-client`, and `shared`.

## Getting Started

```bash
# Install dependencies
yarn install

# Run in development mode (starts Vite + mobile client watcher)
yarn tauri dev
```

This launches the Tauri desktop app with hot-reload for both the editor frontend and mobile client.

## Available Scripts

| Command | Description |
|---------|-------------|
| `yarn tauri dev` | Run the app in development mode |
| `yarn tauri build` | Build release binaries (requires signing key) |
| `yarn test` | Run TypeScript tests |
| `yarn test:watch` | Run tests in watch mode |
| `cargo test` (in `src-tauri/`) | Run Rust tests |
| `yarn format` | Format code with Prettier |
| `yarn format:check` | Check formatting without writing |

## Testing

**TypeScript** (vitest):
```bash
yarn test
```

Tests live alongside source files as `*.test.ts` in `src/utils/`.

**Rust** (cargo test):
```bash
cd src-tauri && cargo test
```

Testing is....tough in tauri. Still needs lots of love, so if you'd like to contribute in this area, it would be very much appreciated!

## Building

Local builds require the `TAURI_SIGNING_PRIVATE_KEY` environment variable for updater artifact signing. For development, use `yarn tauri dev` instead.

Release builds are handled by GitHub Actions. Push a version tag to trigger (or use the script in `scripts/publish.sh`):

```bash
git tag v1.0.0
git push origin v1.0.0
```

This builds for Windows and Linux, then creates a draft GitHub Release.

## Code Style

- TypeScript is formatted with Prettier (run `yarn format` before committing)
- Rust uses standard `rustfmt` conventions
- Imports are sorted by the `@ianvs/prettier-plugin-sort-imports` plugin

## LLM/AI Policy

Use of generative AI in this project should be avoided. All pull requests must disclose if generative AI was used and may be rejected.

## Architecture Notes

- **State management:** Zustand with immer middleware. All widget mutations go through undoable commands.
- **Mobile communication:** WebSocket server (axum) embedded in the Tauri app. Mobile clients connect over LAN.
- **Input simulation:** Platform-specific - VJoy on Windows, uinput on Linux, mock on macOS (dev only).
- **Screen sets:** Stored as folders (`{id}/layout.json` + `images/` + `sounds/`) in the app data directory.
- **Export format:** Zip archive of the screen set folder.

## Pull Requests

- Keep PRs focused on a single change
- Ensure `yarn test` and `cargo test` pass
- Run `yarn format:check` to verify formatting

# Add Slider Widget with Axis Support

## Context

The app currently supports only discrete button presses (key down/up) via the `InputDevice` trait. We want to add continuous axis control so that a mobile client can send slider/pad values that map to virtual joystick axes. This requires changes at every layer: Rust models, platform implementations, WebSocket events, TypeScript models, and frontend widgets (both editor and mobile client).

**Design decisions:**

- New top-level widget type (`slider`), not a button subtype
- Normalized `0.0..1.0` values in the app layer; platform implementations scale to native ranges
- All 8 VJoy axes supported (X, Y, Z, RX, RY, RZ, Slider1, Slider2)
- Slider orientation is configurable: horizontal, vertical, or 2D pad (X/Y mapped to two axes)

---

## Step 1: Rust — Extend `InputKey` and `InputDevice` trait

**Files:**

- `src-tauri/src/input/mod.rs`

Add a new `JoystickAxis` enum and a `set_axis` method to the trait:

```rust
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum JoystickAxis {
    X, Y, Z, Rx, Ry, Rz, Slider1, Slider2,
}
```

Add to `InputDevice` trait:

```rust
async fn set_axis(&mut self, axis: JoystickAxis, value: f64);
fn available_axes(&self) -> Vec<JoystickAxis>;
```

`value` is `0.0..1.0` normalized. Each platform scales internally.

Update `input_worker` match to handle the new `MobileEvent::AxisMove` variant.

---

## Step 2: Rust — Add `MobileEvent::AxisMove`

**Files:**

- `src-tauri/src/state.rs`

```rust
AxisMove { axis: JoystickAxis, value: f64 },
```

---

## Step 3: Rust — Windows VJoy axis implementation

**Files:**

- `src-tauri/src/input/windows.rs`

Implement `set_axis` using VJoy's axis API. Map `JoystickAxis` variants to VJoy axis IDs. Scale `0.0..1.0` → `0..32767` (VJoy's native range).

Implement `available_axes` returning all 8 axes.

---

## Step 4: Rust — Linux evdev axis implementation

**Files:**

- `src-tauri/src/input/linux.rs`

In `EvdevDevice::new()`, register absolute axes on the virtual device via `VirtualDeviceBuilder::with_absolute_axis()`. Use `AbsoluteAxisSetup` with range `0..32767` (matching VJoy for consistency).

Implement `set_axis` by emitting `EventType::ABSOLUTE` events. Map `JoystickAxis` to evdev `AbsoluteAxisType` codes (`ABS_X`, `ABS_Y`, `ABS_Z`, `ABS_RX`, `ABS_RY`, `ABS_RZ`, `ABS_MISC` for sliders — or use `ABS_THROTTLE`/`ABS_RUDDER` if more appropriate).

Implement `available_axes`.

**Note:** The Linux device should become a combined keyboard+joystick device, or we create a second virtual device for the joystick axes. Creating a second device is cleaner — avoids changing the keyboard device identity.

---

## Step 5: Rust — Mock axis implementation

**Files:**

- `src-tauri/src/input/mock.rs`

Log axis changes. Return all 8 axes from `available_axes`.

---

## Step 6: Rust — Slider widget model

**Files:**

- `src-tauri/src/widget/mod.rs` — add `Slider(slider::SliderAttributes)` to `Widget` enum
- New file: `src-tauri/src/widget/slider.rs`

```rust
pub enum SliderOrientation { Horizontal, Vertical }

pub struct SliderAction {
    pub axis: JoystickAxis,
    pub min: f64,  // default 0.0
    pub max: f64,  // default 1.0
}

pub struct SliderAttributes {
    pub widget: WidgetBase,
    pub orientation: SliderOrientation,
    pub axis: SliderAction,
    pub text: TextAttributes,
    // track/thumb styling TBD — keep minimal for now
}
```

For 2D pad mode, we'll add a separate `PadAttributes` widget type (or a `Pad` variant) that holds two `SliderAction` (x-axis and y-axis). This can be a follow-up or included here as a `SliderMode` enum with `Single { axis, orientation }` and `Pad { x_axis, y_axis }` variants.

---

## Step 7: Rust — Tauri command for available axes

**Files:**

- `src-tauri/src/commands/input.rs`

Add:

```rust
#[tauri::command]
pub fn get_available_axes() -> Vec<JoystickAxis> { ... }
```

Register in `generate_handler!`.

---

## Step 8: TypeScript — Extend shared models

**Files:**

- `shared/models/index.d.ts`

```typescript
export type JoystickAxis =
  | "x"
  | "y"
  | "z"
  | "rx"
  | "ry"
  | "rz"
  | "slider1"
  | "slider2";

export type SliderOrientation = "horizontal" | "vertical";

export type SliderAction = {
  axis: JoystickAxis;
  min: number; // 0.0
  max: number; // 1.0
};

export type SliderAttributes = WidgetBase<"slider"> & {
  orientation: SliderOrientation;
  axis: SliderAction;
  text: TextAttributes;
};
```

Update `WidgetType` to include `"slider"`.
Update `Widget` union to include `SliderAttributes`.

---

## Step 9: Mobile client — Slider widget component

**Files:**

- New file: `mobile-client/src/widgets/Slider.tsx`

React component that renders an `<input type="range">` (or custom touch-friendly slider). On value change, sends `{ axisMove: { axis, value } }` via the WebSocket message callback.

For 2D pad mode, render a touch area that tracks pointer position and maps X/Y to two axis values.

Throttle/debounce the WebSocket messages (e.g., 60fps cap or `requestAnimationFrame`) to avoid flooding.

---

## Step 10: Mobile client — Wire up ScreenRenderer

**Files:**

- `mobile-client/src/ScreenRenderer.tsx`

Add `handleAxisMove` callback. Render `<Slider>` for `widget.type === "slider"`.

---

## Step 11: Desktop editor — Slider widget + attributes panel

**Files:**

- New file: `src/widgets/Slider.tsx` (editor preview version — non-interactive, shows shape)
- `src/widgets/WidgetRenderer.tsx` — add slider rendering branch
- `src/editor/attributes-panel/AttributesPanel.tsx` — add slider attributes section
- New file: `src/editor/attributes-panel/SliderSpecificsSection.tsx` — axis picker, orientation, min/max
- `src/editor/Toolbar.tsx` — add "Slider" to the Add widget menu
- New file: `src/utils/createSlider.ts` — default slider factory

---

## Step 12: Store updates

**Files:**

- `src/store/widget.ts` — handle slider widget type in any widget-type-specific logic
- `src/store/selectors.ts` — if any selectors filter by widget type

---

## Implementation order

1. **Rust core** (Steps 1-5): models, trait, platform impls — can compile and test in isolation
2. **Rust widget model** (Steps 6-7): slider widget type, Tauri command
3. **TypeScript models** (Step 8): shared types
4. **Mobile client** (Steps 9-10): slider widget + wiring
5. **Desktop editor** (Steps 11-12): editor widget, attributes panel, toolbar

---

## Verification

- **Rust**: `cargo build` on each platform (or at least check Windows/Linux compilation with `cargo check`)
- **Frontend**: `npm run dev` / `vite dev` — add a slider widget in the editor, verify it appears in the canvas
- **Mobile**: open mobile client, verify slider renders and sends WebSocket messages
- **End-to-end**: with VJoy running (Windows) or uinput (Linux), verify that sliding sends axis values to the virtual device. Use a joystick tester app (e.g., `jstest` on Linux, VJoy Monitor on Windows) to confirm axis movement.

import { Widget } from "@common/shared/models";

export function findNextAvailableButton(widgets: Widget[]): number {
  const unavailable = widgets
    .filter((w) => w.type === "button")
    .flatMap((w) =>
      w.input.steps
        .filter(
          (s) =>
            s.type === "press" || s.type === "keyDown" || s.type === "keyUp",
        )
        .map((s) => (s as { key: { type: string; button?: number } }).key)
        .filter((k) => k.type === "joystickButton")
        .map((k) => k.button!),
    );
  let i = 1;
  while (unavailable.includes(i)) {
    ++i;
  }
  return i;
}

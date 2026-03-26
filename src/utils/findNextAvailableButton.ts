import {Widget} from "@common/shared/models";

export function findNextAvailableButton(widgets: Widget[]): number {
  const unavailable = widgets
    .filter(w => w.type === "button")
    .map(w => {
      const key = w.input.key;
      return key.type === "joystickButton" ? key.button : null;
    })
    .filter((b): b is number => b !== null);
  let i = 1;
  while(unavailable.includes(i)) {
    ++i;
  }
  return i;
}

import {Widget} from "@common/shared/models";

export function findNextAvailableButton(widgets: Widget[]): number {
  const unavailable = widgets
    .filter(w => w.type === "button")
    .map(w => w.vjoyButton.button);
  let i = 1;
  while(unavailable.includes(i)) {
    ++i;
  }
  return i;
}

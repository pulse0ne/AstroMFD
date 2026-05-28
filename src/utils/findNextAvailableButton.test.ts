import { Widget } from "@common/shared/models";
import { describe, expect, it } from "vitest";

import { findNextAvailableButton } from "./findNextAvailableButton";

function makeButton(buttonNum: number): Widget {
  return {
    type: "button",
    id: `btn-${buttonNum}`,
    buttonType: "action",
    input: {
      steps: [
        {
          type: "press",
          key: { type: "joystickButton", button: buttonNum },
          duration: 100,
        },
      ],
    },
    navTarget: null,
    text: { text: "", fontSize: 14, fontFamily: "sans-serif", color: "#fff", align: "center", verticalAlign: "middle", bold: false, italic: false },
    pressed: { shape: {}, text: {} },
    shape: {
      position: { x: 0, y: 0 },
      size: { width: 50, height: 50 },
      fill: { type: "solid", color: "#333" },
      stroke: { color: "#fff", width: 1 },
      cornerRadius: 4,
      opacity: 1,
    },
  } as unknown as Widget;
}

describe("findNextAvailableButton", () => {
  it("returns 1 when no buttons exist", () => {
    expect(findNextAvailableButton([])).toBe(1);
  });

  it("returns 1 when widgets have no joystick buttons", () => {
    const label: Widget = {
      type: "label",
      id: "lbl-1",
      usesVariables: false,
      text: { text: "hi", fontSize: 14, fontFamily: "sans-serif", color: "#fff", align: "center", verticalAlign: "middle", bold: false, italic: false },
      shape: {
        position: { x: 0, y: 0 },
        size: { width: 50, height: 50 },
        fill: { type: "solid", color: "#333" },
        stroke: { color: "#fff", width: 1 },
        cornerRadius: 0,
        opacity: 1,
      },
    } as unknown as Widget;
    expect(findNextAvailableButton([label])).toBe(1);
  });

  it("returns next available after used buttons", () => {
    const widgets = [makeButton(1), makeButton(2), makeButton(3)];
    expect(findNextAvailableButton(widgets)).toBe(4);
  });

  it("fills gaps in button numbering", () => {
    const widgets = [makeButton(1), makeButton(3)];
    expect(findNextAvailableButton(widgets)).toBe(2);
  });

  it("handles non-sequential usage", () => {
    const widgets = [makeButton(5), makeButton(2), makeButton(1)];
    expect(findNextAvailableButton(widgets)).toBe(3);
  });
});

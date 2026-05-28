import { Screen } from "@common/shared/models";
import { describe, expect, it } from "vitest";

import { duplicateScreen } from "./duplicateScreen";

function makeScreen(): Screen {
  return {
    id: "screen-1",
    name: "Main",
    backgroundColor: "#000",
    crtEffect: false,
    effects: { scanlines: false, lcdGrid: false, phosphorGlow: false, vignette: false, flicker: false, chromaticAberration: false, noise: false },
    widgets: [
      {
        type: "label",
        id: "widget-1",
        usesVariables: false,
        text: { text: "A", fontSize: 14, fontFamily: "sans-serif", color: "#fff", align: "center", verticalAlign: "middle", bold: false, italic: false },
        shape: {
          position: { x: 0, y: 0 },
          size: { width: 50, height: 50 },
          fill: { type: "solid", color: "#333" },
          stroke: { color: "#fff", width: 1 },
          cornerRadius: 0,
          opacity: 1,
        },
      },
      {
        type: "label",
        id: "widget-2",
        usesVariables: false,
        text: { text: "B", fontSize: 14, fontFamily: "sans-serif", color: "#fff", align: "center", verticalAlign: "middle", bold: false, italic: false },
        shape: {
          position: { x: 60, y: 0 },
          size: { width: 50, height: 50 },
          fill: { type: "solid", color: "#333" },
          stroke: { color: "#fff", width: 1 },
          cornerRadius: 0,
          opacity: 1,
        },
      },
    ],
  } as unknown as Screen;
}

describe("duplicateScreen", () => {
  it("generates a new screen ID", () => {
    const original = makeScreen();
    const copy = duplicateScreen(original);
    expect(copy.id).not.toBe(original.id);
  });

  it("regenerates all widget IDs", () => {
    const original = makeScreen();
    const copy = duplicateScreen(original);
    expect(copy.widgets[0].id).not.toBe("widget-1");
    expect(copy.widgets[1].id).not.toBe("widget-2");
    expect(copy.widgets[0].id).not.toBe(copy.widgets[1].id);
  });

  it("preserves widget content", () => {
    const original = makeScreen();
    const copy = duplicateScreen(original);
    expect(copy.widgets).toHaveLength(2);
    expect(copy.name).toBe("Main");
    expect(copy.backgroundColor).toBe("#000");
  });

  it("does not mutate the original", () => {
    const original = makeScreen();
    const copy = duplicateScreen(original);
    copy.widgets[0].shape.position.x = 999;
    expect(original.widgets[0].shape.position.x).toBe(0);
  });
});

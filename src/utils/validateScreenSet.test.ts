import { Screen, ScreenSet, Widget } from "@common/shared/models";
import { describe, expect, it } from "vitest";

import { validateScreenSet } from "./validateScreenSet";

function makeShape(x = 0, y = 0, w = 50, h = 50) {
  return {
    position: { x, y },
    size: { width: w, height: h },
    fill: { type: "solid" as const, color: "#333" },
    stroke: { color: "#fff", width: 1 },
    cornerRadius: 0,
    opacity: 1,
  };
}

function makeButton(id: string, opts: Partial<{ buttonType: string; navTarget: string | null; steps: unknown[] }> = {}): Widget {
  return {
    type: "button",
    id,
    buttonType: opts.buttonType ?? "action",
    input: { steps: opts.steps ?? [{ type: "press", key: { type: "joystickButton", button: 1 }, duration: 100 }] },
    navTarget: opts.navTarget ?? null,
    text: { text: id, fontSize: 14, fontFamily: "sans-serif", color: "#fff", align: "center", verticalAlign: "middle", bold: false, italic: false },
    pressed: { shape: {}, text: {} },
    shape: makeShape(),
  } as unknown as Widget;
}

function makeScreen(id: string, name: string, widgets: Widget[] = []): Screen {
  return {
    id,
    name,
    backgroundColor: "#000",
    crtEffect: false,
    effects: { scanlines: false, lcdGrid: false, phosphorGlow: false, vignette: false, flicker: false, chromaticAberration: false, noise: false },
    widgets,
  };
}

function makeScreenSet(screens: Screen[]): ScreenSet {
  return {
    id: "test-set",
    name: "Test",
    size: { width: 800, height: 480 },
    screens,
  };
}

describe("validateScreenSet", () => {
  it("returns valid for a well-formed screen set", () => {
    const btn = makeButton("b1", { buttonType: "navigation", navTarget: "s2" });
    const btn2 = makeButton("b2", { buttonType: "navigation", navTarget: "s1" });
    const ss = makeScreenSet([
      makeScreen("s1", "Main", [btn]),
      makeScreen("s2", "Other", [btn2]),
    ]);
    const result = validateScreenSet(ss);
    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it("detects duplicate screen IDs", () => {
    const ss = makeScreenSet([
      makeScreen("s1", "Screen A"),
      makeScreen("s1", "Screen B"),
    ]);
    const result = validateScreenSet(ss);
    expect(result.valid).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ level: "error", message: "Duplicate screen ID detected." }),
    );
  });

  it("warns about empty screens", () => {
    const ss = makeScreenSet([makeScreen("s1", "Empty")]);
    const result = validateScreenSet(ss);
    expect(result.valid).toBe(true);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ level: "warning", message: "Screen has no widgets." }),
    );
  });

  it("detects duplicate widget IDs within a screen", () => {
    const w1 = makeButton("dup");
    const w2 = makeButton("dup");
    const ss = makeScreenSet([makeScreen("s1", "Main", [w1, w2])]);
    const result = validateScreenSet(ss);
    expect(result.valid).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ level: "error", message: 'Duplicate widget ID "dup".' }),
    );
  });

  it("warns about off-canvas widgets", () => {
    const offscreen: Widget = {
      type: "label",
      id: "off",
      usesVariables: false,
      text: { text: "hi", fontSize: 14, fontFamily: "sans-serif", color: "#fff", align: "center", verticalAlign: "middle", bold: false, italic: false },
      shape: makeShape(-200, -200, 50, 50),
    } as unknown as Widget;
    const ss = makeScreenSet([makeScreen("s1", "Main", [offscreen])]);
    const result = validateScreenSet(ss);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ level: "warning", message: expect.stringContaining("off-canvas") }),
    );
  });

  it("warns about action buttons with no steps", () => {
    const btn = makeButton("empty-btn", { buttonType: "action", steps: [] });
    const ss = makeScreenSet([makeScreen("s1", "Main", [btn])]);
    const result = validateScreenSet(ss);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ level: "warning", message: expect.stringContaining("no actions configured") }),
    );
  });

  it("warns about nav buttons with no target", () => {
    const btn = makeButton("nav-btn", { buttonType: "navigation", navTarget: null });
    const ss = makeScreenSet([makeScreen("s1", "Main", [btn])]);
    const result = validateScreenSet(ss);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ level: "warning", message: expect.stringContaining("no target screen") }),
    );
  });

  it("errors when nav button points to non-existent screen", () => {
    const btn = makeButton("nav-btn", { buttonType: "navigation", navTarget: "ghost" });
    const ss = makeScreenSet([makeScreen("s1", "Main", [btn])]);
    const result = validateScreenSet(ss);
    expect(result.valid).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ level: "error", message: expect.stringContaining("non-existent screen") }),
    );
  });

  it("warns about unreachable screens when multiple screens exist", () => {
    const ss = makeScreenSet([
      makeScreen("s1", "Main", [makeButton("b1")]),
      makeScreen("s2", "Orphan", [makeButton("b2")]),
    ]);
    const result = validateScreenSet(ss);
    expect(result.issues.filter((i) => i.message.includes("No nav route"))).toHaveLength(2);
  });

  it("does not warn about unreachable screens for single-screen sets", () => {
    const ss = makeScreenSet([makeScreen("s1", "Solo", [makeButton("b1")])]);
    const result = validateScreenSet(ss);
    expect(result.issues.filter((i) => i.message.includes("No nav route"))).toHaveLength(0);
  });
});

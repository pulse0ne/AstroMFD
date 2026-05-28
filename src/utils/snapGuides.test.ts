import { Widget } from "@common/shared/models";
import { describe, expect, it } from "vitest";

import { computeSnapGuides } from "./snapGuides";

function makeWidget(id: string, x: number, y: number, w: number, h: number): Widget {
  return {
    type: "label",
    id,
    usesVariables: false,
    text: { text: "", fontSize: 14, fontFamily: "sans-serif", color: "#fff", align: "center", verticalAlign: "middle", bold: false, italic: false },
    shape: {
      position: { x, y },
      size: { width: w, height: h },
      fill: { type: "solid", color: "#333" },
      stroke: { color: "#fff", width: 1 },
      cornerRadius: 0,
      opacity: 1,
    },
  } as unknown as Widget;
}

const canvas = { width: 800, height: 480 };

describe("computeSnapGuides", () => {
  it("snaps to canvas left edge", () => {
    const result = computeSnapGuides(
      { x: 3, y: 100 },
      { width: 50, height: 50 },
      [],
      "active",
      canvas,
    );
    expect(result.x).toBe(0);
    expect(result.guides.some((g) => g.orientation === "vertical" && g.position === 0)).toBe(true);
  });

  it("snaps to canvas center horizontally", () => {
    const result = computeSnapGuides(
      { x: 373, y: 100 },
      { width: 50, height: 50 },
      [],
      "active",
      canvas,
    );
    // center of dragged widget (373 + 25 = 398) should snap to 400
    expect(result.x).toBe(375);
    expect(result.guides.some((g) => g.orientation === "vertical" && g.position === 400)).toBe(true);
  });

  it("snaps to another widget's edge", () => {
    const other = makeWidget("other", 200, 100, 60, 40);
    const result = computeSnapGuides(
      { x: 257, y: 50 },
      { width: 50, height: 50 },
      [other],
      "active",
      canvas,
    );
    // right edge of other is 260, left edge of drag is 257 - within threshold
    expect(result.x).toBe(260);
    expect(result.guides.some((g) => g.orientation === "vertical" && g.position === 260)).toBe(true);
  });

  it("does not snap when beyond threshold", () => {
    const result = computeSnapGuides(
      { x: 50, y: 50 },
      { width: 50, height: 50 },
      [],
      "active",
      canvas,
    );
    // 50 is far from 0 (left edge diff = 50), far from 400 (center), far from 800 (right)
    expect(result.x).toBe(50);
    expect(result.guides.filter((g) => g.orientation === "vertical")).toHaveLength(0);
  });

  it("snaps to canvas top edge", () => {
    const result = computeSnapGuides(
      { x: 100, y: 2 },
      { width: 50, height: 50 },
      [],
      "active",
      canvas,
    );
    expect(result.y).toBe(0);
    expect(result.guides.some((g) => g.orientation === "horizontal" && g.position === 0)).toBe(true);
  });

  it("ignores the active widget itself", () => {
    const self = makeWidget("active", 100, 100, 50, 50);
    const result = computeSnapGuides(
      { x: 200, y: 200 },
      { width: 50, height: 50 },
      [self],
      "active",
      canvas,
    );
    // Should not snap to self's edges (100, 150, 125)
    expect(result.x).toBe(200);
    expect(result.y).toBe(200);
  });

  it("snaps both axes independently", () => {
    const result = computeSnapGuides(
      { x: 2, y: 3 },
      { width: 50, height: 50 },
      [],
      "active",
      canvas,
    );
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
  });
});

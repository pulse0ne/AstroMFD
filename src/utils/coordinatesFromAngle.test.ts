import { describe, expect, it } from "vitest";

import { coordinatesFromAngle } from "./coordinatesFromAngle";

describe("coordinatesFromAngle", () => {
  it("returns horizontal line at 0 degrees", () => {
    const { start, end } = coordinatesFromAngle(100, 100, 0);
    expect(end.x).toBeGreaterThan(start.x);
    expect(start.y).toBeCloseTo(end.y);
  });

  it("returns vertical line at 90 degrees", () => {
    const { start, end } = coordinatesFromAngle(100, 100, 90);
    expect(start.x).toBeCloseTo(end.x);
    expect(end.y).toBeGreaterThan(start.y);
  });

  it("centers on the rectangle", () => {
    const { start, end } = coordinatesFromAngle(200, 100, 0);
    const cx = (start.x + end.x) / 2;
    const cy = (start.y + end.y) / 2;
    expect(cx).toBeCloseTo(100);
    expect(cy).toBeCloseTo(50);
  });

  it("produces symmetrical start/end around center at 45 degrees", () => {
    const { start, end } = coordinatesFromAngle(100, 100, 45);
    const cx = (start.x + end.x) / 2;
    const cy = (start.y + end.y) / 2;
    expect(cx).toBeCloseTo(50);
    expect(cy).toBeCloseTo(50);
  });

  it("handles non-square dimensions", () => {
    const { start, end } = coordinatesFromAngle(300, 100, 0);
    const cx = (start.x + end.x) / 2;
    const cy = (start.y + end.y) / 2;
    expect(cx).toBeCloseTo(150);
    expect(cy).toBeCloseTo(50);
  });
});

import { Widget } from "@common/shared/models";
import { describe, expect, it } from "vitest";

import { duplicateWidget } from "./duplicateWidget";

function makeWidget(): Widget {
  return {
    type: "label",
    id: "original-id",
    usesVariables: false,
    text: { text: "Hello", fontSize: 14, fontFamily: "sans-serif", color: "#fff", align: "center", verticalAlign: "middle", bold: false, italic: false },
    shape: {
      position: { x: 10, y: 20 },
      size: { width: 100, height: 50 },
      fill: { type: "solid", color: "#333" },
      stroke: { color: "#fff", width: 1 },
      cornerRadius: 4,
      opacity: 1,
    },
  } as unknown as Widget;
}

describe("duplicateWidget", () => {
  it("generates a new unique ID", () => {
    const original = makeWidget();
    const copy = duplicateWidget(original);
    expect(copy.id).not.toBe(original.id);
    expect(copy.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it("preserves all other properties", () => {
    const original = makeWidget();
    const copy = duplicateWidget(original);
    expect(copy.type).toBe(original.type);
    expect(copy.shape.position).toEqual(original.shape.position);
    expect(copy.shape.size).toEqual(original.shape.size);
  });

  it("creates a deep copy (no shared references)", () => {
    const original = makeWidget();
    const copy = duplicateWidget(original);
    copy.shape.position.x = 999;
    expect(original.shape.position.x).toBe(10);
  });
});

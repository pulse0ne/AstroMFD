import { describe, expect, it } from "vitest";

import { gradientString } from "./gradientString";

describe("gradientString", () => {
  it("produces a linear-gradient string", () => {
    const result = gradientString({
      type: "linear",
      stops: [
        { id: "1", color: "#ff0000", position: 0 },
        { id: "2", color: "#0000ff", position: 100 },
      ],
    });
    expect(result).toBe(
      "linear-gradient(90deg, #ff0000 0%, #0000ff 100%)",
    );
  });

  it("produces a radial-gradient string", () => {
    const result = gradientString({
      type: "radial",
      stops: [
        { id: "1", color: "white", position: 0 },
        { id: "2", color: "black", position: 100 },
      ],
    });
    expect(result).toBe("radial-gradient(circle, white 0%, black 100%)");
  });

  it("handles multiple stops", () => {
    const result = gradientString({
      type: "linear",
      stops: [
        { id: "1", color: "red", position: 0 },
        { id: "2", color: "green", position: 50 },
        { id: "3", color: "blue", position: 100 },
      ],
    });
    expect(result).toBe(
      "linear-gradient(90deg, red 0%, green 50%, blue 100%)",
    );
  });
});

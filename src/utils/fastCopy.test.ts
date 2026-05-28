import { describe, expect, it } from "vitest";

import { fastCopy } from "./fastCopy";

describe("fastCopy", () => {
  it("creates a deep clone of an object", () => {
    const original = { a: 1, b: { c: 2 } };
    const copy = fastCopy(original);
    expect(copy).toEqual(original);
    expect(copy).not.toBe(original);
    expect(copy.b).not.toBe(original.b);
  });

  it("mutations to copy do not affect original", () => {
    const original = { nested: { value: 10 } };
    const copy = fastCopy(original);
    copy.nested.value = 99;
    expect(original.nested.value).toBe(10);
  });

  it("handles arrays", () => {
    const original = [{ id: "a" }, { id: "b" }];
    const copy = fastCopy(original);
    copy[0].id = "changed";
    expect(original[0].id).toBe("a");
  });

  it("handles null and primitives", () => {
    expect(fastCopy(null)).toBe(null);
    expect(fastCopy(42)).toBe(42);
    expect(fastCopy("hello")).toBe("hello");
  });
});

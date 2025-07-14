import { describe, it, expect } from "vitest";
import transformToNumberOrUndefined from "./transformToNumberOrUndefined";

describe("transformToNumberOrUndefined", () => {
  it("returns number when value is a numeric string", () => {
    expect(transformToNumberOrUndefined("42.56")).toBe(42.56);
    expect(transformToNumberOrUndefined("-123.4556")).toBe(-123.4556);
    expect(transformToNumberOrUndefined("0")).toBe(0);
  });

  it("returns number when value is a number", () => {
    expect(transformToNumberOrUndefined(123)).toBe(123);
    expect(transformToNumberOrUndefined(3.14)).toBe(3.14);
    expect(transformToNumberOrUndefined(3.145654555)).toBe(3.145654555);
    expect(transformToNumberOrUndefined(-123.4556)).toBe(-123.4556);
    expect(transformToNumberOrUndefined(0)).toBe(0);
  });

  it("returns undefined for anything that's not a number", () => {
    expect(transformToNumberOrUndefined(undefined)).toBeUndefined();
    expect(transformToNumberOrUndefined(null)).toBeUndefined();
    expect(transformToNumberOrUndefined("")).toBeUndefined();
    expect(transformToNumberOrUndefined(false)).toBeUndefined();
    expect(transformToNumberOrUndefined("abc")).toBeUndefined();
    expect(transformToNumberOrUndefined("123abc")).toBeUndefined();
    expect(transformToNumberOrUndefined([])).toBeUndefined();
    expect(transformToNumberOrUndefined([5])).toBeUndefined();
    expect(transformToNumberOrUndefined([1, 2])).toBeUndefined();
    expect(transformToNumberOrUndefined({})).toBeUndefined();
    expect(transformToNumberOrUndefined(true)).toBeUndefined();
  });
});

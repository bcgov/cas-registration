import { describe, it, expect } from "vitest";

// A sample function to test
function add(a: number, b: number) {
  return a + b;
}

// Tests
describe("add function", () => {
  it("should return the sum of two positive numbers", () => {
    expect(add(2, 3)).toBe(5);
  });
});

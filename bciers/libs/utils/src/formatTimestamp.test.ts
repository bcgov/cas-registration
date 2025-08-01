import { describe, it, expect } from "vitest";
import formatTimestamp from "./formatTimestamp";

describe("formatTimestamp", () => {
  it("should return undefined for empty stringnull/undefined", () => {
    expect(formatTimestamp("")).toBeUndefined();
    expect(formatTimestamp(null as any)).toBeUndefined();
    expect(formatTimestamp(undefined as any)).toBeUndefined();
  });

  it("should format datetime timestamp in Pacific time", () => {
    const result = formatTimestamp("2023-12-25T14:30:00Z");
    expect(result).toContain("\n");
    expect(result).toBe("Dec 25, 2023\n6:30 a.m. PST");
  });
});

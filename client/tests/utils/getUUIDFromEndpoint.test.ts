import { describe, expect } from "vitest";

import getUUIDFromEndpoint from "@/app/utils/getUUIDFromEndpoint";

describe("getUUIDFromEndpoint", () => {
  it("should return the UUID from the endpoint", () => {
    const endpoint = "/registration/endpoint/ba2ba62a121842e0942aab9e92ce8822";
    const result = getUUIDFromEndpoint(endpoint);
    expect(result).toBe("ba2ba62a121842e0942aab9e92ce8822");
  });

  it("should return an empty string if the endpoint contains a malformed UUID", () => {
    const endpoint = "/registration/endpoint/ba2ba62a121842e0942aab9e92ce882";
    const result = getUUIDFromEndpoint(endpoint);
    expect(result).toBe(null);
  });

  it("should return an empty string if the endpoint does not contain a UUID", () => {
    const endpoint = "/registration/endpoint";
    const result = getUUIDFromEndpoint(endpoint);
    expect(result).toBe(null);
  });
});

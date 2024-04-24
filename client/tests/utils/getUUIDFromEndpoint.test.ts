import { describe, expect } from "vitest";

import getUUIDFromEndpoint from "@/app/utils/getUUIDFromEndpoint";

describe("getUUIDFromEndpoint", () => {
  it("should return the UUID from the endpoint", () => {
    const endpoint =
      "/registration/user/user-app-role/ba2ba62a121842e0942aab9e92ce8822";
    const result = getUUIDFromEndpoint(endpoint);
    expect(result).toBe("ba2ba62a121842e0942aab9e92ce8822");
  });

  it("should return an empty string if the endpoint contains a malformed UUID", () => {
    const endpoint =
      "registration/user/user-app-role/ba2ba62a121842e0942aab9e92ce882";
    const result = getUUIDFromEndpoint(endpoint);
    expect(result).toBe(null);
  });

  it("should return an empty string if the endpoint does not contain a UUID", () => {
    const endpoint = "registration/user/user-app-role";
    const result = getUUIDFromEndpoint(endpoint);
    expect(result).toBe(null);
  });

  it("should throw an error if the endpoint is not allowed", () => {
    const endpoint = "registration/user/not-allowed-endpoint";
    expect(() => getUUIDFromEndpoint(endpoint)).toThrowError(
      "Endpoint is not allowed",
    );
  });
});

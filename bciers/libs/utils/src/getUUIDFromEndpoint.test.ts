import getUUIDFromEndpoint, {
  endpointAllowList,
} from "@bciers/utils/src/getUUIDFromEndpoint";

describe("getUUIDFromEndpoint", () => {
  it.each(endpointAllowList)(
    "should return the UUID from the endpoint %s",
    (endpoint) => {
      const endpointWithUUID = `${endpoint}/ba2ba62a121842e0942aab9e92ce8822`;
      const result = getUUIDFromEndpoint(endpointWithUUID);
      expect(result).toBe("ba2ba62a121842e0942aab9e92ce8822");
    },
  );
  it("should return null if the endpoint contains a malformed UUID", () => {
    const endpoint =
      "registration/user/user-app-role/ba2ba62a121842e0942aab9e92ce882";
    const result = getUUIDFromEndpoint(endpoint);
    expect(result).toBe(null);
  });

  it("should return null if the endpoint does not contain a UUID", () => {
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

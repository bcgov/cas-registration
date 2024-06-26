import { describe, expect, vi } from "vitest";
import { getEnvValue } from "@bciers/actions";

vi.stubEnv("SITEMINDER_KEYCLOAK_LOGOUT_URL", "https://example.com");

vi.unmock("@bciers/actions");

describe("getEnvValue", () => {
  it("should return the value of the NODE_ENV environment variable", async () => {
    const result = await getEnvValue("NODE_ENV");
    expect(result).toBe("test");
  });

  it("should return the value of the SITEMINDER_KEYCLOAK_LOGOUT_URL environment variable", async () => {
    const result = await getEnvValue("SITEMINDER_KEYCLOAK_LOGOUT_URL");
    expect(result).toBe("https://example.com");
  });

  it("should throw an error if the key is not in the allow list", async () => {
    await expect(getEnvValue("ENV_VAR_NOT_IN_ALLOWED_LIST")).rejects.toThrow(
      "Invalid env key",
    );
  });
});

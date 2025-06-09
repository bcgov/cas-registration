import { describe, it, expect } from "vitest";
import authConfig from "./auth.config";

describe("auth.config cookies", () => {
  it("should set sameSite to 'strict' for sessionToken", () => {
    expect(authConfig.cookies.sessionToken.options.sameSite).toBe("strict");
  });

  it("should set sameSite to 'strict' for callbackUrl", () => {
    expect(authConfig.cookies.callbackUrl.options.sameSite).toBe("strict");
  });

  it("should set sameSite to 'strict' for csrfToken", () => {
    expect(authConfig.cookies.csrfToken.options.sameSite).toBe("strict");
  });
});

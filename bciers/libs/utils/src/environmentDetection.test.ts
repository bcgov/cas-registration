import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as environmentDetection from "./environmentDetection";

describe("environmentDetection", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("isVitestEnvironment", () => {
    it("should return true when VITEST_POOL_ID is set", () => {
      process.env.VITEST_POOL_ID = "1";
      expect(environmentDetection.isVitestEnvironment()).toBe(true);
    });

    it("should return true when VITEST_WORKER_ID is set", () => {
      process.env.VITEST_WORKER_ID = "1";
      expect(environmentDetection.isVitestEnvironment()).toBe(true);
    });

    it("should return false when neither Vitest env var is set", () => {
      delete process.env.VITEST_POOL_ID;
      delete process.env.VITEST_WORKER_ID;
      expect(environmentDetection.isVitestEnvironment()).toBe(false);
    });
  });

  describe("isCIEnvironment", () => {
    it("should return true when CI is 'true'", () => {
      process.env.CI = "true";
      expect(environmentDetection.isCIEnvironment()).toBe(true);
    });

    it("should return false when CI is not 'true'", () => {
      process.env.CI = "false";
      expect(environmentDetection.isCIEnvironment()).toBe(false);
    });

    it("should return false when CI is undefined", () => {
      delete process.env.CI;
      expect(environmentDetection.isCIEnvironment()).toBe(false);
    });
  });

  describe("isProductionEnvironment", () => {
    it("should return true when NODE_ENV is 'production'", () => {
      Object.defineProperty(process.env, "NODE_ENV", {
        value: "production",
        writable: true,
      });
      expect(environmentDetection.isProductionEnvironment()).toBe(true);
    });

    it("should return false when NODE_ENV is not 'production'", () => {
      Object.defineProperty(process.env, "NODE_ENV", {
        value: "development",
        writable: true,
      });
      expect(environmentDetection.isProductionEnvironment()).toBe(false);
    });
  });

  describe("shouldUseSecureCookies", () => {
    it("should return false when running in Vitest", () => {
      // Since we're running in Vitest, this should always return false
      expect(environmentDetection.shouldUseSecureCookies()).toBe(false);
    });

    it("should return false when running in CI", () => {
      process.env.CI = "true";
      expect(environmentDetection.shouldUseSecureCookies()).toBe(false);
    });

    it("should return false when not in production", () => {
      Object.defineProperty(process.env, "NODE_ENV", {
        value: "development",
        writable: true,
      });
      expect(environmentDetection.shouldUseSecureCookies()).toBe(false);
    });

    it("should return false when in production but in Vitest", () => {
      Object.defineProperty(process.env, "NODE_ENV", {
        value: "production",
        writable: true,
      });
      // Still in Vitest environment due to VITEST_POOL_ID
      expect(environmentDetection.shouldUseSecureCookies()).toBe(false);
    });

    it("should return false when in production but in CI", () => {
      Object.defineProperty(process.env, "NODE_ENV", {
        value: "production",
        writable: true,
      });
      process.env.CI = "true";
      expect(environmentDetection.shouldUseSecureCookies()).toBe(false);
    });
  });
});

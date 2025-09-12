/**
 * Environment detection utilities
 *
 * These utilities help detect different runtime environments
 * to conditionally execute code based on the current context.
 */

/**
 * Detects if the code is running in a Vitest test environment
 * @returns true if running in Vitest, false otherwise
 */
export function isVitestEnvironment(): boolean {
  return (
    process.env.VITEST_POOL_ID !== undefined ||
    process.env.VITEST_WORKER_ID !== undefined
  );
}

/**
 * Detects if the code is running in a CI environment
 * @returns true if running in CI, false otherwise
 */
export function isCIEnvironment(): boolean {
  return process.env.CI === "true";
}

/**
 * Detects if the code is running in a production environment
 * @returns true if running in production, false otherwise
 */
export function isProductionEnvironment(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Determines if secure cookies should be used
 * This considers production environment but excludes CI and Vitest environments
 * @returns true if secure cookies should be used, false otherwise
 */
export function shouldUseSecureCookies(): boolean {
  return (
    isProductionEnvironment() && !isCIEnvironment() && !isVitestEnvironment()
  );
}

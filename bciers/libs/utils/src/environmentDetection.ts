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
 * Detects if the code is running in a Playwright e2e test environment
 * @returns true if running in Playwright e2e tests, false otherwise
 */
export function isPlaywrightEnvironment(): boolean {
  return process.env.E2E_BASEURL === "http://localhost:3000/";
}

/**
 * Detects if the code is running in a local environment
 * @returns true if running locally, false otherwise
 */
export function isLocalEnvironment(): boolean {
  return process.env.ENVIRONMENT === "local";
}

/**
 * Determines if secure cookies should be used
 * This considers production environment but excludes CI and Vitest environments
 * @returns true if secure cookies should be used, false otherwise
 */
export function shouldUseSecureCookies(): boolean {
  return !isLocalEnvironment() && !isCIEnvironment() && !isVitestEnvironment();
}

/*
 * This is to get around the ChunkLoadError
 * Checks if the previous page's base path matches the current page's base path
 * @returns true if the base paths match, false otherwise
 */
export const isSameBasePath = () => {
  const prevBasePath = getPrevBasePathOrHome();
  const currBasePath = window.location.pathname.split("/").filter(Boolean)[0];
  return prevBasePath.includes(currBasePath);
};

export const getPrevBasePathOrHome = () => {
  const doc = typeof document !== "undefined" ? document.referrer : "";
  if (!doc) return "/";
  return new URL(doc).pathname;
};

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

/**
 * Environments where the dashboard docs chat may run. Local only for now; add
 * "dev" here once the dev namespace has its own CHAT_API_KEY secret.
 */
const CHAT_ENVIRONMENTS = ["local"];

/**
 * Determines if the dashboard docs chat (apps/dashboard/app/api/chat) is enabled.
 * Requires an allowed ENVIRONMENT plus CHAT_API_KEY and CHAT_MODELS. CI is not
 * checked: some local .env files set CI=true, and CI pipelines have no key.
 * @returns true if the chat should be shown and served, false otherwise
 */
export function isChatEnabled(): boolean {
  return (
    CHAT_ENVIRONMENTS.includes(process.env.ENVIRONMENT ?? "") &&
    Boolean(process.env.CHAT_API_KEY) &&
    Boolean(process.env.CHAT_MODELS?.trim())
  );
}

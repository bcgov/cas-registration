import { test as baseTest, type BrowserContext } from "@playwright/test";
import { test as happoTest } from "happo/playwright";
import { mergeTests } from "@playwright/test";
import { AppName } from "@/administration-e2e/utils/constants";
import {
  setupTestEnvironment,
  getStorageStateForRole,
} from "@bciers/e2e/utils/helpers";

// Only merge Happo if we're in CI or if API keys are present
const isHappoEnabled =
  process.env.CI === "true" ||
  (process.env.HAPPO_API_KEY && process.env.HAPPO_API_SECRET);

const test = isHappoEnabled
  ? mergeTests(baseTest, happoTest)
  : baseTest.extend<{
      happoScreenshot: (locator: any, options: any) => Promise<void>;
    }>({
      // Provide a no-op happoScreenshot fixture when Happo is disabled
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      happoScreenshot: async ({}, use) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        await use(() => Promise.resolve());
      },
    });

export function setupTest(role: string, hookType: "beforeEach" | "beforeAll") {
  const storageState = getStorageStateForRole(role);

  const testWithRole = test.extend({
    context: async (
      { browser, baseURL }: { browser: any; baseURL: any },
      use: (context: BrowserContext) => Promise<void>,
    ) => {
      if (!browser) {
        throw new Error("Browser fixture is required");
      }
      const newContext = await browser.newContext({
        storageState,
        baseURL,
      });
      // eslint-disable-next-line react-hooks/rules-of-hooks
      await use(newContext);
    },
  });

  const setupHook = async () => {
    await setupTestEnvironment(`${AppName}-${role}`);
  };

  if (hookType === "beforeEach") {
    (testWithRole as typeof baseTest).beforeEach(setupHook);
  } else {
    (testWithRole as typeof baseTest).beforeAll(setupHook);
  }

  return testWithRole;
}

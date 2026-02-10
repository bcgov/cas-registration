import { test as baseTest, type BrowserContext } from "@playwright/test";
import { test as happoTest } from "happo/playwright";
import { mergeTests } from "@playwright/test";
import {
  setupTestEnvironment,
  getStorageStateForRole,
} from "@bciers/e2e/utils/helpers";

// Only merge Happo if API keys are present (they are empty during nightly builds)
const isHappoEnabled =
  !!process.env.HAPPO_API_KEY && !!process.env.HAPPO_API_SECRET;

const test = isHappoEnabled
  ? mergeTests(baseTest, happoTest)
  : baseTest.extend<{
      happoScreenshot: (locator: any, options: any) => Promise<void>;
    }>({
      // Provide a no-op happoScreenshot fixture when Happo is disabled

      happoScreenshot: async ({}, use) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        await use(() => Promise.resolve());
      },
    });

export function setupTest(role: string, hookType: "beforeEach" | "beforeAll") {
  const storageState = getStorageStateForRole(role);

  const testWithRole: typeof baseTest = test.extend({
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
    await setupTestEnvironment();
  };

  if (hookType === "beforeEach") {
    testWithRole.beforeEach(setupHook);
  } else {
    testWithRole.beforeAll(setupHook);
  }

  return testWithRole;
}

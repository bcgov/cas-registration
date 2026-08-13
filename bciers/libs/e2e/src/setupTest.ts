import { test as baseTest, type BrowserContext } from "@playwright/test";
import { test as happoTest } from "happo/playwright";
import { mergeTests } from "@playwright/test";
import {
  setupTestEnvironment,
  getStorageStateForRole,
} from "@bciers/e2e/utils/helpers";
import { E2E_FIXED_CLOCK } from "@bciers/e2e/utils/constants";

// Only merge Happo if explicitly enabled (disabled during nightly builds)
const isHappoEnabled = process.env.HAPPO_ENABLED === "true";

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

export interface SetupTestOptions {
  /**
   * Pin the browser clock to {@link E2E_FIXED_CLOCK}.
   *
   * For suites taking Happo screenshots of client-side dates, which would
   * otherwise report a visual diff every day. Off by default: it changes what
   * every page in the suite sees as "now", so only opt in where it's needed.
   */
  fixedClock?: boolean;
}

export function setupTest(
  role: string,
  hookType: "beforeEach" | "beforeAll",
  { fixedClock = false }: SetupTestOptions = {},
) {
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
      if (fixedClock) {
        await newContext.clock.setFixedTime(E2E_FIXED_CLOCK);
      }
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

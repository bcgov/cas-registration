import { test } from "@playwright/test";
import { AppName } from "@/administration-e2e/utils/constants";
import { setupTestEnvironment } from "@bciers/e2e/utils/helpers";
import { getStorageStateForRole } from "@bciers/e2e/utils/helpers";

const happoPlaywright = require("happo-playwright");

export function setupBeforeEachTest(role: string) {
  // 👤 run test using the storageState for this role
  test.use({ storageState: getStorageStateForRole(role) });

  test.beforeEach(async ({ context }) => {
    await setupTestEnvironment(`${AppName}-${role}`);
    await happoPlaywright.init(context);
  });

  test.afterEach(async () => {
    await happoPlaywright.finish();
  });

  return test;
}

import { test as baseTest } from "@playwright/test";
import { test as happoTest } from "happo-playwright";
import { mergeTests } from "@playwright/test";
import { AppName } from "@/administration-e2e/utils/constants";
import { setupTestEnvironment } from "@bciers/e2e/utils/helpers";
import { getStorageStateForRole } from "@bciers/e2e/utils/helpers";

const test = mergeTests(baseTest, happoTest);

export function setupBeforeEachTest(role: string) {
  // 👤 run test using the storageState for this role
  test.use({ storageState: getStorageStateForRole(role) });

  test.beforeEach(async () => {
    await setupTestEnvironment(`${AppName}-${role}`);
  });

  return test;
}

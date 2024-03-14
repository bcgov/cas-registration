// 🧪 Suite to test the bceidbusiness new user workflow using storageState
// 🔍 Asserts new user is redirected to profile

import { test } from "@playwright/test";
// 🪄 Page Object Models
import { DashboardPOM } from "@/e2e/poms/dashboard";
import { HomePOM } from "@/e2e/poms/home";
// ☰ Enums
import { DataTestID } from "@/e2e/utils/enums";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });
test.describe("Test Workflow cas_pending", () => {
  // 👤 run test using the storageState for this role
  const storageState = JSON.parse(
    process.env.E2E_CAS_PENDING_STORAGE as string,
  );
  // Note: specify storageState for each test file or test group, instead of setting it in the config. https://playwright.dev/docs/next/auth#reuse-signed-in-state
  test.use({ storageState: storageState }); // this will error if no such file or directory
  test("Test Navigation to `home` is redirected to Dashboard page", async ({
    page,
  }) => {
    // 🛸 Navigate to home page
    const homePage = new HomePOM(page);
    await homePage.route();
    // 🔍 Assert that the pending message is displayed
    await homePage.page.waitForSelector(DataTestID.MESSAGE_PENDING);
  });
  test("Test Redirect to Dashboard", async ({ page }) => {
    // 🛸 Navigate to dashboard page
    const dashboardPage = new DashboardPOM(page);
    await dashboardPage.route();
    // 🔍 Assert that the current URL ends with "(authenticated)/dashboard"
    await dashboardPage.urlIsCorrect();
  });
});

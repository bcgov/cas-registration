// 🧪 Suite to test the bceidbusiness new user workflow using storageState

import { test } from "@playwright/test";
// 🪄 Page Object Models
import { DashboardPOM } from "@/e2e/poms/dashboard";
import { OperatorPOM } from "@/e2e/poms/operator";
// 🛠️ Helpers
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });
// 🛠️ Helpers

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });
test.describe("Test Workflow industry_user_admin", () => {
  // 👤 run test using the storageState for this role
  const storageState = JSON.parse(
    process.env.E2E_INDUSTRY_USER_ADMIN_STORAGE as string,
  );
  // Note: specify storageState for each test file or test group, instead of setting it in the config. https://playwright.dev/docs/next/auth#reuse-signed-in-state
  test.use({ storageState: storageState }); // this will error if no such file or directory
  test("Test Redirect to Dashboard", async ({ page }) => {
    // 🛸 Navigate to dashboard page
    const dashboardPage = new DashboardPOM(page);
    await dashboardPage.route();
    // 🔍 Assert that the current URL ends with "(authenticated)/dashboard"
    await dashboardPage.urlIsCorrect();
  });

  test("Operators Tile workflow", async ({ page }) => {
    // 🛸 Navigate to operators tile page
    const dashboardPage = new DashboardPOM(page);
    const operatorPage = new OperatorPOM(page);
    await dashboardPage.route();

    // Click Operator tile and view the Operator form
    await dashboardPage.clickOperatorsTileIndustry();
    await operatorPage.urlIsCorrect();
    await operatorPage.operatorViewIsCorrect();

    // industry_user_admin is able to edit the operator form
    await operatorPage.clickEditInformation();
    await operatorPage.editOperatorInformation();
    await operatorPage.clickSaveAndReturn();

    // There may be a better wait to wait for the redirect than using this wait
    await page.waitForTimeout(2000);

    // Verify that we have returned to the dashboard
    await dashboardPage.urlIsCorrect();
  });
});

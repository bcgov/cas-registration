// 🧪 Suite to test the bceidbusiness new user workflow using storageState
// 🔍 Asserts new user is redirected to profile

import { test, expect } from "@playwright/test";
// 🪄 Page Object Models
import { DashboardPOM } from "@/e2e/poms/dashboard";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });
test.describe("Test Workflow cas_pending", () => {
  // 👤 run test using the storageState for this role
  const storageState = process.env.E2E_CAS_PENDING_STORAGE;
  // Note: specify storageState for each test file or test group, instead of setting it in the config. https://playwright.dev/docs/next/auth#reuse-signed-in-state
  test.use({ storageState: storageState }); // this will error if no such file or directory
  test("Test Redirect to Dashboard", async ({ page }) => {
    // 🛸 Navigate to dashboard page
    const dashboardPage = new DashboardPOM(page);
    await dashboardPage.route();
    // 🔍 Assert that the current URL ends with "(authenticated)/dashboard"
    await dashboardPage.urlIsCorrect();
  });
  test("Test Pending Message", async ({ page }) => {
    // Navigate to dashboard page
    const dashboardPage = new DashboardPOM(page);
    await dashboardPage.route();
    // 🔍 Assert that the pending message is displayed
    await dashboardPage.page.waitForSelector(
      '[data-testid="dashboard-pending-message"]',
    );
    //  Assert all text content
    const allText = await dashboardPage.page.textContent(
      '[data-testid="dashboard-pending-message"]',
    );
    //  Combine selectors and expected text
    const expectedText = [
      "Welcome to B.C. Industrial Emissions Reporting System",
      "Your access request is pending approval.",
      "Once approved, you can log back in with access to the system.",
    ];
    //  Assert all text content
    for (const text of expectedText) {
      expect(allText).toContain(text);
    }
  });
});

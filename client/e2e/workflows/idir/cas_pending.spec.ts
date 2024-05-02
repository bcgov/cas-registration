// 🧪 Suite to test the cas_pending workflows using storageState

import { test } from "@playwright/test";
// 🪄 Page Object Models
import { DashboardPOM } from "@/e2e/poms/dashboard";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });
test.describe("Test Workflow cas_pending", () => {
  // 👤 run test using the storageState for this role
  const storageState = JSON.parse(
    process.env.E2E_CAS_PENDING_STORAGE_STATE as string
  );
  test.use({ storageState: storageState });
  test("Test Dashboard Message", async ({ page }) => {
    const dashboardPage = new DashboardPOM(page);
    // 🛸 Navigate to dashboard page
    await dashboardPage.route();
    // 🔍 Assert that the current URL ends with "/dashboard"
    await dashboardPage.urlIsCorrect();
    // 🔍 Assert pending message
    await dashboardPage.hasMessagePending();
  });
});

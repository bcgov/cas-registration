// 🧪 Suite to test the industry_user workflows using storageState

import { test } from "@playwright/test";
// 🪄 Page Object Models
import { DashboardPOM } from "@/admin/e2e/poms/dashboard";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
import { OperatorPOM } from "@/admin/e2e/poms/operator";
import { E2EValue } from "@/admin/e2e/utils/enums";
import { UserRole } from "@/e2e/utils/enums";
// 🛠️ Helpers
import {
  analyzeAccessibility,
  setupTestEnvironment,
  takeStabilizedScreenshot,
} from "@/e2e/utils/helpers";
dotenv.config({ path: "./e2e/.env.local" });
const happoPlaywright = require("happo-playwright");

test.beforeEach(async ({ context }) => {
  await happoPlaywright.init(context);

  //  await setupTestEnvironment(UserRole.INDUSTRY_USER);
});

test.afterEach(async () => {
  await happoPlaywright.finish();
});

test.describe("Test Workflow industry_user", () => {
  // 👤 run test using the storageState for this role
  const storageState = JSON.parse(
    process.env.E2E_INDUSTRY_USER_STORAGE_STATE as string,
  );
  test.use({ storageState: storageState });
  test("Select existing operator (via legal name) and request admin access", async ({
    page,
  }) => {
    let pageContent;
    // 🛸 Navigate to dashboard page
    const dashboardPage = new DashboardPOM(page);
    await dashboardPage.route();
    // 🔍 Assert current URL
    await dashboardPage.urlIsCorrect();
    // 🛸 Navigates to select operator

    await takeStabilizedScreenshot(happoPlaywright, page, {
      component: "Select operator page",
      variant: "default",
    });

    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);
  });
});

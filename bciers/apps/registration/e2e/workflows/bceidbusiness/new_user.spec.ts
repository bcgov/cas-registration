// 🧪 Suite to test the bceidbusiness new user workflow using storageState

import { test } from "@playwright/test";
// 🪄 Page Object Models
import { DashboardPOM } from "@/e2e/poms/dashboard";
import { ProfilePOM } from "@/e2e/poms/profile";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });
test.describe("Test Workflow new user", () => {
  // 👤 run test using the storageState for this role
  const storageState = JSON.parse(
    process.env.E2E_NEW_USER_STORAGE_STATE as string,
  );
  test.use({ storageState: storageState }); // this will error if no such file or directory
  test("Test Redirect to Profile", async ({ page }) => {
    // 🛸 Navigate to dashboard page
    const dashboardPage = new DashboardPOM(page);
    await dashboardPage.route();
    // 🔍 Assert that the current URL is profile
    await new ProfilePOM(page).urlIsCorrect();
  });
});

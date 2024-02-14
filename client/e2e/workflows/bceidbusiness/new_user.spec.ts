// 🧪 Suite to test the bceidbusiness new user workflow using storageState
// 🔍 Asserts new user is redirected to profile

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
  const storageState = process.env.E2E_NEW_USER_STORAGE;
  // Note: specify storageState for each test file or test group, instead of setting it in the config. https://playwright.dev/docs/next/auth#reuse-signed-in-state
  test.use({ storageState: storageState }); // this will error if no such file or directory
  test("Test Redirect to Profile", async ({ page }) => {
    // 🛸 Navigate to dashboard page
    const dashboardPage = new DashboardPOM(page);
    await dashboardPage.route();
    // 🔍 Assert that the current URL ends with "(authenticated/profile"
    const profilePage = new ProfilePOM(page);
    await profilePage.urlIsCorrect();
  });
  test("Test Update Profile", async ({ page }) => {
    // 🛸 Navigate to profile page
    const profilePage = new ProfilePOM(page);
    await profilePage.route();
    await profilePage.update();
    // 🔍 Assert that the current URL ends with "(authenticated)/dashboard"
    const dashboardPage = new DashboardPOM(page);
    await dashboardPage.urlIsCorrect();
  });
});

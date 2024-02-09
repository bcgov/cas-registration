// 🧪 Suite to test the bceidbusiness new user workflow using storageState
// 🔍 Asserts new user is redirected to profile

import { test, expect } from "@playwright/test";
// 🪄 Page Object Models
import { HomePOM } from "@/e2e/poms/home";
import { ProfilePOM } from "@/e2e/poms/profile";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });
test.describe("Test Workflow new user", () => {
  // 👤 run test as new user with no role
  const storageState = process.env.E2E_NEW_USER_STORAGE;
  // Note: specify storageState for each test file or test group, instead of setting it in the config. https://playwright.dev/docs/next/auth#reuse-signed-in-state
  test.use({ storageState: storageState }); // this will error if no such file or directory
  test("Test Redirect to Profile", async ({ page }) => {
    // 🛸 Navigate to home page
    const homePage = new HomePOM(page);
    await homePage.route();
    // 🔍 Assert user is logged in
    await homePage.userIsLoggedIn();
    // 🔍 Assert that the current URL ends with "/profile"
    const profilePage = new ProfilePOM(page);
    await profilePage.urlIsCorrect();
  });
});

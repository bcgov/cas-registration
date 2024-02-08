// 🧪 Suite to test the bceidbusiness new user workflow

import { test } from "@playwright/test";
// 🪄 Page Object Models
import { ProfilePOM } from "@/e2e/poms/profile";
import { HomePOM } from "@/e2e/poms/home";
// ⛏️ Helpers
import { navigateAndWaitForLoad } from "@/e2e/utils/helpers";
// ☰ Enums
import {
  ActionButton,
  AppRoute,
  DataTestID,
  LoginLink,
  UserRole,
} from "@/e2e/utils/enums";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

// Set the test URL
const url = process.env.E2E_BASEURL as string;
// 🏷 Annotate test suite as serial
test.describe.serial("Test Workflow Role: none", () => {
  test.beforeEach(async ({ page }) => {
    const homePage = new HomePOM(page);
    await homePage.route();
    await homePage.login(
      process.env.E2E_NEW_USER as string,
      process.env.E2E_NEW_USER_PASSWORD as string,
      UserRole.NEW_USER as string
    );
    await homePage.isLoggedIn();
  });

  test("New User Redirect To Profile From Login", async ({ page }) => {
    // 🔍 Assert that the current URL ends with "/profile"
    const profilePage = new ProfilePOM(page);
    await profilePage.isCorrectUrl();
  });
  test("New User Redirect To Profile From All Paths", async ({ page }) => {
    // 🔍 Assert that the current URL ends with "/profile"
    const profilePage = new ProfilePOM(page);
    await profilePage.isCorrectUrl();
    // 🛸 Navigate to the another page
    await navigateAndWaitForLoad(page, url + AppRoute.DASHBOARD);
    // 🔍 Assert that the current URL ends with "/profile"
    await profilePage.isCorrectUrl();
  });
});

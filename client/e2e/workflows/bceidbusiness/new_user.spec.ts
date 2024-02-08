// 🧪 Suite to test the bceidbusiness new user workflow

import { test } from "@playwright/test";
// 🪄 Page Object Models
import { ProfilePOM } from "@/e2e/poms/profile";
import { HomePOM } from "@/e2e/poms/home";
// 👤 User Roles
import { UserRole } from "@/e2e/utils/enums";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

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

  test("New User Profile Page Redirect", async ({ page }) => {
    const profilePage = new ProfilePOM(page);
    await profilePage.isCorrectUrl();
  });
});

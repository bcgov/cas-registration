// 🧪 Suite to test the Home page `http://localhost:3000/home`
// 🔍 Asserts the user can login, logout, and login

import { test } from "@playwright/test";
// 🪄 Page Object Models
import { HomePOM } from "@/e2e/poms/home";
import { ProfilePOM } from "@/e2e/poms/profile";
// ☰ Enums
import { UserRole } from "@/e2e/utils/enums";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });
test.describe("Test Page - Home", () => {
  test.describe(`Test User Role - none`, () => {
    test("Test Login", async ({ page }) => {
      const loggedInPage = new HomePOM(page);
      await loggedInPage.route();
      await loggedInPage.login(
        process.env.E2E_NEW_USER as string,
        process.env.E2E_NEW_USER_PASSWORD as string,
        UserRole.NEW_USER
      );
      await loggedInPage.isLoggedIn();
      // 🔍 Assert that the current URL ends with "/profile"
      const profilePage = new ProfilePOM(page);
      await profilePage.route();
      // await profilePage.isCorrectUrl();
    });
  });
});

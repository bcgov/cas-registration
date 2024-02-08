// 🧪 Suite to test the Home page `http://localhost:3000/home`
// 🔍 Asserts the user can login, logout, and login

import { test } from "@playwright/test";
// 🪄page object model
import { HomePOM } from "@/e2e/poms/home";
//import { ProfilePOM } from "@/e2e/poms/profile";
// ☰ Enums
import { UserRole } from "@/e2e/utils/enums";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });
test.describe("Test Page - Home", () => {
  // ➰ Loop through the entries of UserRole enum
  for (let [role, value] of Object.entries(UserRole)) {
    // Only login once for CAS ID...i.e. CAS_PENDING
    // Check if the current role is to skip executing tests
    if (value === UserRole.CAS_ADMIN || value === UserRole.CAS_ANALYST) {
      continue;
    }
    test.describe(`Test User Role - ${value}`, () => {
      // Set user and password based on the user role
      let user = process.env.E2E_CAS_USER as string;
      let password = process.env.E2E_CAS_USER_PASSWORD as string;
      role = "E2E_" + role;
      switch (value) {
        case UserRole.INDUSTRY_USER_ADMIN:
        case UserRole.INDUSTRY_USER:
        case UserRole.NEW_USER:
          user = process.env[`${role}`] || "";
          password = process.env[`${role}_PASSWORD`] || "";
          break;
      }
      test("Test Login", async ({ page }) => {
        const loggedInPage = new HomePOM(page);
        await loggedInPage.route();
        await loggedInPage.login(user, password, role);
        await loggedInPage.isLoggedIn();
        // 🔍 Assert that the current URL ends with "/profile"
        // const profilePage = new ProfilePOM(page);
        // await profilePage.isCorrectUrl();
      });
    });
  }
});

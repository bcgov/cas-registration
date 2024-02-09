// 🧪 Suite to test the Home page `http://localhost:3000/home`
// 🔍 Asserts the user can login, logout, and login

import { test, expect } from "@playwright/test";
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
  // ➰ Loop through the entries of UserRole enum
  for (let [role, value] of Object.entries(UserRole)) {
    // Only login once for CAS ID...i.e. CAS_PENDING
    // Check if the current role is to skip executing tests
    if (value === UserRole.CAS_ADMIN || value === UserRole.CAS_ANALYST) {
      continue;
    }
    test.describe(`Test User Role`, () => {
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
      //****************TEMP*******************************/
      if (value === UserRole.NEW_USER) {
        test(`Test Login - ${value}`, async ({ page }) => {
          // 🛸 Navigate to home page
          const homePage = new HomePOM(page);
          await homePage.route();
          // 🔑 Login
          await homePage.login(user, password, value);
          // 🔍 Assert user is logged in
          expect(await homePage.userIsLoggedIn()).toBeTruthy();
          // 🛸 Navigate to profile page
          const profilePage = new ProfilePOM(page);
          await profilePage.route();
          // 🔍 Assert user is logged in
          expect(await homePage.userIsLoggedIn()).toBeTruthy();
          // 🔍 Assert correct url
          expect(await profilePage.urlIsCorrect()).toBeTruthy();
        });
      }
    });
  }
});

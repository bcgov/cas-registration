// 🧪 Suite to test the onboarding\Home page `http://localhost:3000/home`

import { test, expect } from "@playwright/test";
// 🪄 Page Object Models
import { DashboardPOM } from "@/e2e/poms/dashboard";
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
  test("Test Route", async ({ page }) => {
    const homePage = new HomePOM(page);
    await homePage.route();
    // 🔍 Assert correct url
    homePage.urlIsCorrect();
  });

  test.describe(`Test User Role`, () => {
    // ➰ Loop through the entries of UserRole enum
    for (let [role, value] of Object.entries(UserRole)) {
      // Only login once for CAS ID...i.e. CAS_PENDING
      // Check if the current role is to be skipped executing tests
      if (value === UserRole.CAS_ADMIN || value === UserRole.CAS_ANALYST) {
        continue;
      }
      test(`Test Login/Logout - ${value}`, async ({ page }) => {
        // 👤 Set user and password based on the user role
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
        // 🛸 Navigate to home page
        const homePage = new HomePOM(page);
        await homePage.route();
        // 🔍 Assert that the current URL ends with "/home"
        await homePage.urlIsCorrect();
        // 🔍 Assert that the login buttons are available
        await expect(homePage.buttonLoginBCeID).toBeVisible();
        await expect(homePage.buttonLoginIDIR).toBeVisible();
        // 🔑 Login
        await homePage.login(user, password, value);
        // 🔍 Assert user is logged in
        await homePage.userIsLoggedIn();
        // 🔍 Assert that the current URL is correct
        switch (value) {
          case UserRole.NEW_USER:
            // 🔍 Assert that the current URL ends with "/profile"
            const profilePage = new ProfilePOM(page);
            await profilePage.urlIsCorrect();
            break;
          default:
            // 🔍 Assert that the current URL ends with "/dashboard"
            const dashboardPage = new DashboardPOM(page);
            await dashboardPage.urlIsCorrect();
            break;
        }
        // 🔒 Logout
        // 🔍 Assert Keycloak SSO text is visible
        await homePage.logout();
      });
    }
  });
});

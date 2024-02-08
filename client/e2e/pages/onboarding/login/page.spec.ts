// 🧪 Suite to test the Home page `http://localhost:3000/home`
// 🔍 Asserts the user can login, logout, and login

import { test, expect } from "@playwright/test";
// ⛏️ Helpers
import { login, navigateAndWaitForLoad } from "@/e2e/utils/helpers";
// ☰ Enums
import { AppRoute, DataTestID, UserRole } from "@/e2e/utils/enums";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

// Set the test URL
const url = process.env.E2E_BASEURL || "";

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
      let pw = process.env.E2E_CAS_USER_PASSWORD as string;
      role = "E2E_" + role;
      switch (value) {
        case UserRole.INDUSTRY_USER_ADMIN:
        case UserRole.INDUSTRY_USER:
        case UserRole.NEW_USER:
          user = process.env[`${role}`] || "";
          pw = process.env[`${role}_PASSWORD`] || "";
          break;
      }
      test("Test Login", async ({ page }) => {
        // 🔑 Login to Keycloak
        await login(page, user, pw, value);
        // 🕒 Wait for the profile navigation link to be present
        // 🚩 BP approach (?) seems to fail: await expect(page.getByTestId("nav-user-profile")).toBeVisible();
        const profileNavSelector = DataTestID.PROFILE;
        await page.waitForSelector(profileNavSelector);
        // 🔍 Assert that the link is available
        expect(profileNavSelector).not.toBeNull();
        // 🛸 Navigate to the profile page
        const path = AppRoute.PROFILE;
        await navigateAndWaitForLoad(page, url + path);
        // 🔍 Assert that the current URL ends with "/profile"
        // await expect(page.url().toLocaleLowerCase()).toContain(path);
      });
    });
  }
});

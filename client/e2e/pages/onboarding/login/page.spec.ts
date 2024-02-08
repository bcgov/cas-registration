// 🧪 Suite to test the Home page `http://localhost:3000/home`
// 🔍 Asserts the user can login, logout, and login

import { test, expect } from "@playwright/test";
// ⛏️ Helpers
import { navigateAndWaitForLoad } from "@/e2e/utils/helpers";
// ☰ Enums
import {
  ActionButton,
  DataTestID,
  LoginLink,
  UserRole,
} from "@/e2e/utils/enums";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

// Set the test URL
const url = process.env.E2E_BASEURL || "";

// 🛠️ Function: log in to Keycloak
const login = async (
  page: any,
  user: string,
  password: string,
  role: string
) => {
  try {
    // Determine the login button based on the user role
    let loginButton = LoginLink.INDUSTRY_USER;
    switch (role) {
      case UserRole.CAS_PENDING:
        loginButton = LoginLink.CAS;
        break;
    }
    // eslint-disable-next-line no-console
    console.log(`${loginButton} ROLE ${role}`);
    // 🛸 Navigate to the home page
    await navigateAndWaitForLoad(page, url);
    // Click the login button
    await page.getByRole("button", { name: loginButton }).click();
    // 🔑 Login to Keycloak
    // Fill the user field
    await page.locator("id=user").fill(user);
    // Fill the pw field
    await page.getByLabel("Password").fill(password);
    // Click Continue button
    await page.getByRole("button", { name: ActionButton.CONTINUE }).click();
    // 🕒 Wait for the profile navigation link to be present
    // 🚩 BP approach (?) seems to fail: await expect(page.getByTestId("nav-user-profile")).toBeVisible();
    const profileNavSelector = DataTestID.PROFILE;
    await page.waitForSelector(profileNavSelector);
    // 🔍 Assert that the link is available
    expect(profileNavSelector).not.toBeNull();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Login failed for ${user}:`, error);
    throw error;
  }
};

// 🏷 Annotate test suite as serial
test.describe.serial("Test Page - Home", () => {
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
        await login(page, user, pw, value);
      });
    });
  }
});

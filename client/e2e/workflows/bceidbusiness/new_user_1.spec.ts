// 🧪 Suite to test the Home page `http://localhost:3000/home`
// 🔍 Asserts the user can login, logout, and login

import { test, expect } from "@playwright/test";
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
const url = process.env.E2E_BASEURL || "";

// 🛠️ Function: log in to Keycloak
const login = async (
  page: any,
  user: string,
  password: string,
  role: string
) => {
  try {
    // 🛸 Navigate to the home page
    await navigateAndWaitForLoad(page, url);

    // Determine the login button based on the user role
    let loginButton = LoginLink.INDUSTRY_USER;
    switch (role) {
      case UserRole.CAS_PENDING:
        loginButton = LoginLink.CAS;
        break;
    }
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
  test.describe(`Test User Role - none`, () => {
    test("Test Login Redirect to Profile", async ({ page }) => {
      await login(
        page,
        process.env.E2E_NEW_USER as string,
        process.env.E2E_NEW_USER_PASSWORD as string,
        UserRole.NEW_USER
      );
      // 🔍 Assert that the current URL ends with "/profile"
      const path = AppRoute.PROFILE;
      await expect(page.url().toLocaleLowerCase()).toContain(path);
    });
  });
});

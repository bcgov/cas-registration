// 🧪 Suite to test the Home page `http://localhost:3000/home`
// 🔍 Asserts the user can login, logout, and login

import { test, expect } from "@playwright/test";

import * as dotenv from "dotenv";
dotenv.config({
  path: "./e2e/.env.local",
});

// 👤 User Roles
import { UserRole } from "@/e2e/utils/enums";
// 🛸 Login Links
import { LoginLink } from "@/e2e/utils/enums";
// ⛏️ Helpers
import { navigateAndWaitForLoad } from "@/e2e/utils/helpers";

// set the test url
const url = process.env.BASEURL || "";

// 🛠️ Function: log in to Keycloak
const login = async (
  page: any,
  userName: string,
  password: string,
  role: string,
) => {
  try {
    let loginButton = LoginLink.INDUSTRY_USER;
    switch (role) {
      case UserRole.CAS_ADMIN:
      case UserRole.CAS_ANALYST:
      case UserRole.CAS_PENDING:
        loginButton = LoginLink.CAS;
        break;
    }

    // 🛸 Navigate to the home page
    await navigateAndWaitForLoad(page, url);

    // Click the login button
    await page.getByRole("button", { name: loginButton }).click();

    // 🕒 Wait for the user field to be present
    await page.waitForSelector("#user");

    // Click and fill the user field
    await page.locator("#user").click();
    await page.locator("#user").fill(userName);

    // Click and fill the password field
    await page.getByLabel("Password").click();
    await page.getByLabel("Password").fill(password);

    // Click the Continue button
    await page.getByRole("button", { name: "Continue" }).click();

    // 🕒 Wait for the profile navigation link to be present
    const profileNavSelector = '[data-testid="nav-user-profile"]';
    await page.waitForSelector(profileNavSelector);

    switch (role) {
      case UserRole.NEW_USER:
        // 🔍 Assert that the current URL ends with "/profile"
        expect(page.url().toLocaleLowerCase()).toContain("/profile");
        break;
      default:
        // 🔍 Assert that the user profile is in DB and has role allowing access to Dashboard
        expect(page.url().toLocaleLowerCase()).toContain("/dashboard");
        break;
    }
  } catch (error) {
    // Handle any errors that occurred during the authentication process
    // eslint-disable-next-line no-console
    console.error(`Login failed for ${userName}:`, error);
    // Rethrow the error
    throw error;
  }
};
// 🛠️ Function: logout
const logout = async (page: any) => {
  try {
    // 🕒 Wait for the "Log out" button to appear
    await page.waitForSelector('button:has-text("Log out")');
    // Used in scenarios where trigger opens a new browser
    const page1Promise = page.waitForEvent("popup");
    // Click and fill the password field
    await page.getByRole("button", { name: "Log out" }).click();
    const page1 = await page1Promise;
    // 🕒 Wait for the logged out text
    const textLogout = await page1.textContent("text=You are logged out");
    // 🔍 Assert that the logged out message displays
    expect(textLogout).toContain("You are logged out");
  } catch (error) {
    console.error("Error on logout:", error);
  }
};
// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });

test.describe("Test Page - Home", () => {
  // ➰ Loop through the entries of UserRole enum
  for (const [role, value] of Object.entries(UserRole)) {
    test.describe(`Test User Role - ${value}`, () => {
      let user = process.env.CAS_USERNAME;
      let pw = process.env.CAS_PASSWORD;
      switch (value) {
        case UserRole.INDUSTRY_USER_ADMIN:
        case UserRole.INDUSTRY_USER:
        case UserRole.NEW_USER:
          user = process.env[role + "_USERNAME"];
          pw = process.env[role + "_PASSWORD"];
          break;
      }
      test("Test Login Logout Login", async ({ page }) => {
        // Use the helper function for login test
        await login(page, user || "", pw || "", value);
        // Use the helper function for logout test
        await logout(page);
        // Use the helper function for login test
        await login(page, user || "", pw || "", value);
      });
    });
  }
});

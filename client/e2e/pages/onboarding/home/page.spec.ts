// 🧪 Suite to test the Home page `http://localhost:3000/home`
// 🔍 Asserts the user can login, logout, and login

import { test, expect } from "@playwright/test";
import * as dotenv from "dotenv";
import { navigateAndWaitForLoad } from "@/e2e/utils/helpers";
// 👤 User Roles
import { UserRole } from "@/e2e/utils/enums";
// 🛸 Login Links
import { LoginLink } from "@/e2e/utils/enums";

dotenv.config({ path: "./e2e/.env.local" });

// Set the test URL
const url = process.env.BASEURL || "";

// 🛠️ Function: log in to Keycloak
const login = async (
  page: any,
  userName: string,
  password: string,
  role: string,
) => {
  try {
    // 🛸 Navigate to the home page
    await navigateAndWaitForLoad(page, url);

    // Determine the login button based on the user role
    let loginButton = LoginLink.INDUSTRY_USER;
    switch (role) {
      case UserRole.CAS_ADMIN:
      case UserRole.CAS_ANALYST:
      case UserRole.CAS_PENDING:
        loginButton = LoginLink.CAS;
        break;
    }

    // Click the login button
    await page.getByRole("button", { name: loginButton }).click();

    // 🕒 Wait for the user field to be present
    const userField = await page.waitForSelector("#user");
    // 🔍 Assert that the field is available
    expect(userField).not.toBeNull();
    // Fill the field
    await userField.fill(userName);

    // 🕒 Wait for the password field to be present
    const pwField = await page.waitForSelector("#password");
    // 🔍 Assert that the field is available
    expect(pwField).not.toBeNull();
    // Fill the field
    await pwField.fill(password);

    // 🕒Wait for the "Continue" button to be present
    const continueButton = await page.waitForSelector(
      'input[type="submit"][name="btnSubmit"].btn.btn-primary',
    );
    // 🔍 Assert that the button is available
    expect(continueButton).not.toBeNull();
    // Click the "Continue" button
    await continueButton.click();

    // 🕒 Wait for the home page profile navigation link to be present
    const profileNavSelector = '[data-testid="nav-user-profile"]';
    await page.waitForSelector(profileNavSelector);
    // 🔍 Assert that the link is available
    expect(profileNavSelector).not.toBeNull();

    // 🔍 Assert based on user role
    switch (role) {
      case UserRole.NEW_USER:
        expect(page.url().toLocaleLowerCase()).toContain("/profile");
        break;
      default:
        expect(page.url().toLocaleLowerCase()).toContain("/dashboard");
        break;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Login failed for ${userName}:`, error);
    throw error;
  }
};

// 🛠️ Function: logout
const logout = async (page: any) => {
  try {
    // 🕒 Wait for the "Log out" button to appear
    const logoutButton = await page.waitForSelector(
      'button:has-text("Log out")',
    );
    // 🔍 Assert that the button is available
    expect(logoutButton).not.toBeNull();
    // Click the Logout button
    await Promise.all([
      page.waitForNavigation(), // Wait for navigation to complete
      page.getByRole("button", { name: "Log out" }).click(),
    ]);
    // 🕒 Wait for the logged out text
    const textLogout = await page.textContent("text=You are logged out");
    // 🔍 Assert that the logged out message displays
    expect(textLogout).toContain("You are logged out");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error on logout:", error);
  }
};

// 🛠️ Function: loggged In assertions
const loggedIn = async (page: any) => {
  // 🛸 Navigate to the home page
  await navigateAndWaitForLoad(page, url);

  // 🕒 Wait for the "Log out" button to appear
  const logoutButton = await page.waitForSelector('button:has-text("Log out")');
  // 🔍 Assert that the button is available
  expect(logoutButton).not.toBeNull();
};

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });

test.describe("Test Page - Home", () => {
  // ➰ Loop through the entries of UserRole enum
  for (const [role, value] of Object.entries(UserRole)) {
    test.describe(`Test User Role - ${value}`, () => {
      // 👤 run test as this role
      const storageState = process.env[role + "_STORAGE"] || "";
      test.use({ storageState: storageState });
      // Set user and password based on the user role
      let user = process.env.CAS_USERNAME;
      let pw = process.env.CAS_PASSWORD;
      switch (value) {
        case UserRole.INDUSTRY_USER_ADMIN:
        case UserRole.INDUSTRY_USER:
        case UserRole.NEW_USER:
          user = process.env[`${role}_USERNAME`];
          pw = process.env[`${role}_PASSWORD`];
          break;
      }
      test("Test Logged-In, Logout, Login", async ({ page }) => {
        // 🚩 role is already logged in during setup\global.ts
        await loggedIn(page);
        // test logout-login flow
        await logout(page);
        await login(page, user || "", pw || "", value);
      });
    });
  }
});

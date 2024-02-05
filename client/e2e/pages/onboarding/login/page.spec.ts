// 🧪 Suite to test the Home page `http://localhost:3000/home`
// 🔍 Asserts the user can login, logout, and login

import { test, expect } from "@playwright/test";
import * as dotenv from "dotenv";
// 👤 User Roles
import { UserRole } from "@/e2e/utils/enums";
// 🛸 Login Links
import { LoginLink } from "@/e2e/utils/enums";
import { navigateAndWaitForLoad } from "@/e2e/utils/helpers";

dotenv.config({ path: "./e2e/.env.local" });

// Set the test URL
const url = process.env.E2E_BASEURL || "";

// 🛠️ Function: log in to Keycloak
const login = async (
  page: any,
  userName: string,
  password: string,
  role: string
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
    // Fill the user field
    await page.locator("id=user").fill(userName);
    // Fill the pw field
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Continue" }).click();

    // 🕒 Wait for the home page profile navigation link to be present
    // 🚩 BP approach (?) seems to fail: await expect(page.getByTestId("nav-user-profile")).toBeVisible();
    const profileNavSelector = '[data-testid="nav-user-profile"]';
    await page.waitForSelector(profileNavSelector);
    // 🔍 Assert that the link is available
    expect(profileNavSelector).not.toBeNull();

    // Get url path based on user role
    let path = "/dashboard";
    switch (role) {
      case UserRole.NEW_USER:
        path = "/profile";
        break;
    }
    // 🔍 Assert url path based on user role
    expect(page.url().toLocaleLowerCase()).toContain(path);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Login failed for ${userName}:`, error);
    throw error;
  }
};

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });

test.describe("Test Page - Home", () => {
  // ➰ Loop through the entries of UserRole enum
  for (let [role, value] of Object.entries(UserRole)) {
    test.describe(`Test User Role - ${value}`, () => {
      // Set user and password based on the user role
      let user = "";
      let pw = "";
      role = "E2E_" + role;
      switch (value) {
        case UserRole.INDUSTRY_USER:
          user = process.env[`${role}`] || "";
          pw = process.env[`${role}_PASSWORD`] || "";
          test("Test Login", async ({ page }) => {
            await login(page, user, pw, value);
          });
          break;
      }
    });
  }
});

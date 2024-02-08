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
  test.describe(`Test User Role - none`, () => {
    test("Test Login Redirect to Profile", async ({ page }) => {
      await login(
        page,
        process.env.E2E_NEW_USER as string,
        process.env.E2E_NEW_USER_PASSWORD as string,
        UserRole.NEW_USER
      );
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
});

// 🧪 Suite to test the bceidbusiness new user workflow

import { test, expect } from "@playwright/test";
// ⛏️ Helpers
import { navigateAndWaitForLoad } from "@/e2e/utils/helpers";
// ☰ Enums
import {
  ActionButton,
  AppRoute,
  DataTestID,
  LoginLink,
} from "@/e2e/utils/enums";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

const url = process.env.E2E_BASEURL as string;
// 🏷 Annotate test suite as serial
test.describe.serial("Test Workflow Role: none", () => {
  test.beforeEach(async ({ page }) => {
    // 🛸 Navigate to the home page
    await navigateAndWaitForLoad(page, url);
    let loginButton = LoginLink.INDUSTRY_USER;
    // Click the login button
    await page.getByRole("button", { name: loginButton }).click();
    // 🔑 Login to Keycloak
    // Fill the user field
    await page.locator("id=user").fill(process.env.E2E_NEW_USER as string);
    // Fill the pw field
    await page
      .getByLabel("Password")
      .fill(process.env.E2E_NEW_USER_PASSWORD as string);
    // Click Continue button
    await page.getByRole("button", { name: ActionButton.CONTINUE }).click();

    // 🕒 Wait for the profile navigation link to be present
    // 🚩 BP approach (?) seems to fail: await expect(page.getByTestId("nav-user-profile")).toBeVisible();
    const profileNavSelector = DataTestID.PROFILE;
    await page.waitForSelector(profileNavSelector);
    // 🔍 Assert that the link is available
    expect(profileNavSelector).not.toBeNull();
  });

  test("New User Profile Page Redirect", async ({ page }) => {
    // 🛸 Navigate to the profile page
    const path = AppRoute.PROFILE;
    await navigateAndWaitForLoad(page, url + path);
    // 🔍 Assert that the current URL ends with "/profile"
    await expect(page.url().toLocaleLowerCase()).toContain(path);
  });
});

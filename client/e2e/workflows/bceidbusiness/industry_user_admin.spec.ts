// 🧪 Suite to test the bceidbusiness industry_user_admin workflow using storageState
// 🔍 Asserts new user is redirected to dashboard

import { test, expect } from "@playwright/test";
// ⛏️ Helpers
import { navigateAndWaitForLoad } from "@/e2e/utils/helpers";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

// set the test url
const url = process.env.E2E_BASEURL as string;

// 🏷 Annotate test suite as serial
test.describe.serial("Test Workflow industry_user", () => {
  // 👤 run test as new user with no role
  const storageState = process.env.E2E_INDUSTRY_USER_ADMIN_STORAGE;
  test.use({ storageState: storageState }); // this will error if no such file or directory
  test("Test Redirect to Dashboard", async ({ page }) => {
    const path = "dashboard";
    // eslint-disable-next-line no-console
    console.log(storageState);
    // eslint-disable-next-line no-console
    console.log(await page.context().cookies());
    // 🛸 Navigate to the profile page
    await navigateAndWaitForLoad(page, url + path);
    // 🔍 Assert that the current URL ends with "/profile"
    await expect(page.url().toLocaleLowerCase()).toContain(path);
    // Try and navigate to Dashboard
    await page.getByRole("link", { name: "Dashboard" }).click();
    // 🔍 Assert that the current URL ends with "/profile"
    await expect(page.url().toLocaleLowerCase()).toContain(path);
    // 🚩 Profile page test @ `client/e2e/pages/authenticated/dashboard/profile/page.spec.ts`
  });
});

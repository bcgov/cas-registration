// 🧪 Suite to test the bceidbusiness new user workflow using storageState
// 🔍 Asserts new user is redirected to profile

import { test, expect } from "@playwright/test";
// ⛏️ Helpers
import { navigateAndWaitForLoad } from "@/e2e/utils/helpers";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });
import * as path from "path";

// set the test url
const url = process.env.E2E_BASEURL || "";

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });
test.describe("Test Workflow new user", () => {
  // 👤 run test as new user with no role
  const storageState = process.env.E2E_NEW_USER_STORAGE;
  test.use({ storageState: storageState });
  test("Test Redirect to Profile", async ({ page }) => {
    // eslint-disable-next-line no-console
    console.log(storageState);
    console.log(
      (await page.context().storageState({ path: storageState })).origins[0]
        .localStorage
    );
    // 🛸 Navigate to the home page
    await navigateAndWaitForLoad(page, url);
    // 🔍 Assert that the current URL ends with "/profile"
    await expect(page.url().toLocaleLowerCase()).toContain("/profile");
    // Try and navigate to Dashboard
    await page.getByRole("link", { name: "Dashboard" }).click();
    // 🔍 Assert that the current URL ends with "/profile"
    await expect(page.url().toLocaleLowerCase()).toContain("/profile");
    // 🚩 Profile page test @ `client/e2e/pages/authenticated/dashboard/profile/page.spec.ts`
  });
});

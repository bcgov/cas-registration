// 🧪 Suite to test the bceidbusiness new user workflow

import { test, expect } from "@playwright/test";

import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

// ⛏️ Helpers
import { navigateAndWaitForLoad } from "@/e2e/utils/helpers";

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });

// set the test url
const url = process.env.E2E_BASEURL || "http://localhost:3000/";

test.describe("Test Workflow new user", () => {
  // 👤 run test as new user with no role
  const storageState = process.env.E2E_NEW_USER_STORAGE;
  test.use({ storageState: storageState });
  test("Test Redirect to Profile", async ({ page }) => {
    await navigateAndWaitForLoad(page, url);
    // 🔍 Assert that the current URL ends with "/profile"
    expect(page.url().toLocaleLowerCase()).toContain("/profile");
    // Try and navigate to Dashboard
    await page.getByRole("link", { name: "Dashboard" }).click();
    // 🕒 Wait for the navigation to complete
    await page.waitForLoadState("load");
    // 🔍 Assert that the current URL ends with "/profile"
    expect(page.url().toLocaleLowerCase()).toContain("/profile");
    // 🚩 Profile page test @ `client/e2e/pages/authenticated/dashboard/profile/page.spec.ts`
  });
});

// 🧪 Suite to test the onboarding\Home page `http://localhost:3000/home`
// 🔍 Asserts simple test = home page has welcome text

import { test, expect } from "@playwright/test";
// ⛏️ Helpers
import { navigateAndWaitForLoad } from "@/e2e/utils/helpers";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

// Set the test URL
const url = process.env.E2E_BASEURL || "";

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });
test.describe("Test Page - Home", () => {
  test("Test Welcome", async ({ page }) => {
    // 🛸 Navigate to the home page
    await navigateAndWaitForLoad(page, url);
    // 🔍 Assert that home url
    await expect(page.url().toLocaleLowerCase()).toContain("/home");
    // 🔍 Assert welcome text is visible
    await expect(page.getByText("Welcome")).toBeVisible();
  });
});

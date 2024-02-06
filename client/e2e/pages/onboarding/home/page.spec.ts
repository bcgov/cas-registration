// 🧪 Suite to test the Home page `http://localhost:3000/home`
// 🔍 Asserts the user can login, logout, and login

import { navigateAndWaitForLoad } from "@/e2e/utils/helpers";
import { test, expect } from "@playwright/test";

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });

// Set the test URL
const url = process.env.E2E_BASEURL || "";

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

// 🧪 Suite to test the onboarding\Home page `http://localhost:3000/home`
// 🔍 Asserts simple test = home page has welcome text

import { test, expect } from "@playwright/test";
// 🪄page object model
import { HomePOM } from "@/e2e/poms/home";

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });
test.describe("Test Page - Home", () => {
  test("Test Welcome", async ({ page }) => {
    const homePage = new HomePOM(page);
    await homePage.route();
    await homePage.isCorrectUrl();
    // 🔍 Assert welcome text is visible
    await expect(homePage.page.getByText("Welcome")).toBeVisible();
  });
});

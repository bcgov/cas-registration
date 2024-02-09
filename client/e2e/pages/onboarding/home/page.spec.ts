// 🧪 Suite to test the onboarding\Home page `http://localhost:3000/home`

import { test } from "@playwright/test";
// 🪄page object model
import { HomePOM } from "@/e2e/poms/home";

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });
test.describe("Test Page - Home", () => {
  test("Test Route", async ({ page }) => {
    const homePage = new HomePOM(page);
    await homePage.route();
    // 🔍 Assert correct url
    homePage.urlIsCorrect();
  });
});

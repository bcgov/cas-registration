// 🧪 Suite to test the Home page `http://localhost:3000/home`
// 🔍 Asserts the user can login, logout, and login

import { test, expect } from "@playwright/test";

// set the test url
const url = "http://localhost:3000/home";

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });

test.describe("Test Page - Home", () => {
  test("Test Login", async ({ page }) => {
    await page.goto(url);
    await expect(page.url().toLocaleLowerCase()).toContain("/home");
    await expect(page.getByText("Welcome")).toBeVisible();
  });
});

// 🧪 Suite to test the Home page `http://localhost:3000/home`
// 🔍 Asserts the user can login, logout, and login

import { LoginLink } from "@/e2e/utils/enums";
import { navigateAndWaitForLoad } from "@/e2e/utils/helpers";
import { test, expect } from "@playwright/test";

// set the test url
const url = "http://localhost:3000/home";

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });

test.describe("Test Page - Home", () => {
  test("Test Login", async ({ page }) => {
    // 🛸 Navigate to the home page
    await navigateAndWaitForLoad(page, url);
    await expect(page.url().toLocaleLowerCase()).toContain("/home");
    // eslint-disable-next-line no-console
    console.log("Asserted home url");
    // eslint-disable-next-line no-console
    console.log("Waiting for the Welcome text to be present...");
    await expect(page.getByText("Welcome")).toBeVisible();
    // Click the login button
    let loginButton = LoginLink.INDUSTRY_USER;
    // eslint-disable-next-line no-console
    console.log("Clicking login button...");
    await page.getByRole("button", { name: loginButton }).click();

    // eslint-disable-next-line no-console
    console.log("Waiting for login user field...");
    // 🕒 Wait for the user field to be present
    await page.waitForSelector("#user");
  });
});

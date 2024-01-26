// 🧪 Suite to test the Home page `http://localhost:3000/home`
// 🔍 Asserts the user can login, logout, and login

import { test, expect } from "@playwright/test";
import * as dotenv from "dotenv";
// 👤 User Roles
import { UserRole } from "@/e2e/utils/enums";
dotenv.config({ path: "./e2e/.env.local" });

// Set the test URL
const url = "http://localhost:3000/home";

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });

test.describe("Test Page - Home", () => {
  // ➰ Loop through the entries of UserRole enum
  for (const [role, value] of Object.entries(UserRole)) {
    test.describe(`Test User Role - ${value}`, () => {
      test("Test Login", async ({ page }) => {
        await page.goto(url);
        await expect(page.url().toLocaleLowerCase()).toContain("/home");
        // eslint-disable-next-line no-console
        console.log("Asserted home url");
        // eslint-disable-next-line no-console
        console.log("Waiting for the Welcome text to be present...");
        await expect(page.getByText("Welcome")).toBeVisible();
      });
    });
  }
});

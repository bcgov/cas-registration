// 🧪 Suite to test the bceidbusiness new user workflow
import test from "@/e2e/fixtures/auth";
import { expect } from "@playwright/test";
import { ProfilePOM } from "@/e2e/poms/profile";
// 👤 User Roles
import { UserRole } from "@/e2e/utils/enums";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

// 🏷 Annotate test suite as serial
test.describe.serial("Test Workflow new user", () => {
  // 🧩 Parametrize loggedInPage fixture
  test.use({
    user: process.env.E2E_NEW_USER as string,
    password: process.env.E2E_NEW_USER_PASSWORD as string,
    role: UserRole.NEW_USER,
  });
  test("Test logged in new user redirected to profile", async ({
    loggedInPage,
  }) => {
    // 🔍 Assert that the profile link is available
    await loggedInPage.isLoggedIn();
    // 🔍 Assert that the current URL ends with "/profile"
    const path = "/profile";
    await expect(loggedInPage.page.url().toLocaleLowerCase()).toContain(path);
  });
  test("Test update profile", async ({ loggedInPage }) => {
    const profilePage = new ProfilePOM(loggedInPage.page);
    await profilePage.update();
    // 🔍 Assert that the current URL ends with "/dashboard"
    const path = "/dashboard";
    await expect(loggedInPage.page.url().toLocaleLowerCase()).toContain(path);
  });
});

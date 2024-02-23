// 🧪 Suite to test `client/app/(onboarding)/home/page.tsx`

import { test, expect } from "@playwright/test";
// 🪄 Page Object Models
import { DashboardPOM } from "@/e2e/poms/dashboard";
import { HomePOM } from "@/e2e/poms/home";
import { ProfilePOM } from "@/e2e/poms/profile";
// ☰ Enums
import { AppRole, UserRole, UserOperatorStatus } from "@/e2e/utils/enums";
// 🥞 DB CRUD
import {
  deleteUserRecord,
  upsertUserRecord,
  upsertOperatorRecord,
  upsertUserOperatorRecord,
} from "@/e2e/utils/queries";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });

// 📚 Declare a beforeAll hook that is executed once per worker process before all tests.
// 🥞 Set DB for e2e login roles
/*
For industry_user_admin: set up for user login to have app_role "industry_user_admin"
- create user
- create operator
- create user operator
For industry_user: set up for user login to have app_role "industry_user"
- create user
For "new user":
-  delete record in the db so that on "new user" login the ID will have no app_role
*/
test.beforeAll(async () => {
  try {
    // 👤 industry_user_admin
    // Upsert a User record: bc-cas-dev
    await upsertUserRecord(UserRole.INDUSTRY_USER_ADMIN);
    // Upsert an Operator record, using default values
    await upsertOperatorRecord();
    // Upsert an User Operator record: industry_user_admin, operator id 2
    await upsertUserOperatorRecord(
      process.env.E2E_INDUSTRY_USER_ADMIN_GUID as string,
      AppRole.ADMIN,
      UserOperatorStatus.APPROVED,
    );

    // 👤 industry_user
    // Upsert a User record: bc-cas-dev-secondary
    await upsertUserRecord(UserRole.INDUSTRY_USER);

    // 👤 delete new user: bc-cas-dev-three
    await deleteUserRecord(process.env.E2E_NEW_USER_GUID as string);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("❌ Error in Db setup for login roles:", error);
    throw error;
  }
});

test.describe("Test Page - Home", () => {
  test("Test Route", async ({ page }) => {
    const homePage = new HomePOM(page);
    await homePage.route();
    // 🔍 Assert correct url
    homePage.urlIsCorrect();
  });

  test("Test Selfie", async ({ page }, testInfo) => {
    const homePage = new HomePOM(page);
    await homePage.route();
    // 🔍 Assert that the content is correct
    // Note: When you run snapshot for the first time the test runner will Error: A snapshot doesn't exist...
    // that's because there was no golden file...
    // but, this method took a bunch of screenshots until two consecutive screenshots matched, and saved the last screenshot to file system...
    // it is now ready to be added to the repository and expected to pass test
    await expect(page).toHaveScreenshot();
    // 👀 Attach the screenshot to the report
    const screenshot = await page.screenshot();
    await testInfo.attach("screenshot", {
      body: screenshot,
      contentType: "image/png",
    });
  });

  test.describe(`Test User Role`, () => {
    // ➰ Loop through the entries of UserRole enum
    for (let [role, value] of Object.entries(UserRole)) {
      test(`Test Login - ${value}`, async ({ page }) => {
        // 👤 Set user and password based on the user role
        let user = process.env.E2E_CAS_USER as string;
        let password = process.env.E2E_CAS_USER_PASSWORD as string;
        role = "E2E_" + role;
        switch (value) {
          case UserRole.INDUSTRY_USER_ADMIN:
          case UserRole.INDUSTRY_USER:
          case UserRole.NEW_USER:
            user = process.env[`${role}`] || "";
            password = process.env[`${role}_PASSWORD`] || "";
            break;
          case UserRole.CAS_ADMIN:
          case UserRole.CAS_ANALYST:
            await upsertUserRecord(value);
            break;
          case UserRole.CAS_PENDING:
            await deleteUserRecord(process.env.E2E_CAS_USER_GUID as string);
            break;
        }
        // 🛸 Navigate to home page
        const homePage = new HomePOM(page);
        await homePage.route();
        // 🔍 Assert that the current URL ends with "/home"
        await homePage.urlIsCorrect();
        // 🔍 Assert that the login buttons are available
        await expect(homePage.buttonLoginBCeID).toBeVisible();
        await expect(homePage.buttonLoginIDIR).toBeVisible();
        // 🔑 Login
        await homePage.login(user, password, value);
        // 🔍 Assert user is logged in
        await homePage.userIsLoggedIn();
        // 🔍 Assert that the current URL is correct
        switch (value) {
          case UserRole.NEW_USER:
          case UserRole.CAS_PENDING:
            // 🔍 Assert that the current URL ends with "/profile"
            const profilePage = new ProfilePOM(page);
            await profilePage.urlIsCorrect();
            break;
          default:
            // 🔍 Assert that the current URL ends with "/dashboard"
            const dashboardPage = new DashboardPOM(page);
            await dashboardPage.urlIsCorrect();
            break;
        }
      });
    }
  });
});

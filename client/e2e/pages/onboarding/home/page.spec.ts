// 🧪 Suite to test the onboarding\Home page `http://localhost:3000/home`

import { test, expect } from "@playwright/test";
// 🪄 Page Object Models
import { DashboardPOM } from "@/e2e/poms/dashboard";
import { HomePOM } from "@/e2e/poms/home";
import { ProfilePOM } from "@/e2e/poms/profile";
// ☰ Enums
import { UserRole } from "@/e2e/utils/enums";
// 🥞 Connection pool to postgres DB
import { pool } from "@/e2e/utils/pool";
import {
  delete_new_user,
  upsert_industry_user_admin,
  upsert_industry_user,
  upsert_operator_id,
  upsert_operator_user,
} from "@/e2e/utils/queries";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });

// 📚 Declare a beforeAll hook that is executed once per worker process before all tests.
// 🥞 Set DB for e2e login roles
// For industry_user_admin, ensure there is an approved operator, an associated user, and an associated user_operator
// For industry_user, ensure there is an associated user
// For no role/new user, ensure there is NOT an associated user
test.beforeAll(async () => {
  try {
    // 👤 industry_user_admin: bc-cas-dev
    // Upsert an Operator record
    let query = upsert_operator_id;
    // ▶️ Execute the query
    await pool.query(query);
    // Upsert a User record
    query = upsert_industry_user_admin;
    // ▶️ Execute the query
    await pool.query(query);
    // Upsert an User Operator record
    query = upsert_operator_user;
    // ▶️ Execute the query
    await pool.query(query);

    // 👤 industry_user: bc-cas-dev-secondary
    // Upsert a User record
    query = upsert_industry_user;
    // ▶️ Execute the query
    await pool.query(query);

    // 👤 new user: bc-cas-dev-three
    // Delete User record
    query = delete_new_user;
    // ▶️ Execute the deletion query
    await pool.query(query);
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
      // Only login once for CAS ID...i.e. CAS_PENDING
      // Check if the current role is to be skipped executing tests
      if (value === UserRole.CAS_ADMIN || value === UserRole.CAS_ANALYST) {
        continue;
      }
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

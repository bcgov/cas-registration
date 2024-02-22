// 🧪 Suite to test `client/app/(authenticated)/dashboard/page.tsx`

import { test, expect } from "@playwright/test";
// 🪄 Page Object Models
import { DashboardPOM } from "@/e2e/poms/dashboard";
import { ProfilePOM } from "@/e2e/poms/profile";
// ☰ Enums
import { AppRole, UserRole, UserOperatorStatus } from "@/e2e/utils/enums";
// 🥞 DB CRUD
import {
  deleteUserOperatorRecord,
  upsertUserRecord,
  upsertOperatorRecord,
  upsertUserOperatorRecord,
} from "@/e2e/utils/queries";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

// 📚 Declare a beforeAll hook that is executed once per worker process before all tests.
// 🥞 Set DB for dashboard tiles
/*
For industry_user:
- create user
- delete user operator
For industry_user_admin:
- create user
- create operator
- create user operator
*/
test.beforeAll(async () => {
  try {
    // Scenario FrontEndRoles.INDUSTRY_USER_ADMIN where UserOperatorStatus.APPROVED && OperatorStatus.APPROVED;
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
    // Scenario FrontEndRoles.INDUSTRY_USER where userOperatorStatus !== UserOperatorStatus.APPROVED
    // Shows "Select Operator\...1 pending action(s) required" bceidSelectOperatorTile
    // ensure user is not associated with any operator
    await deleteUserOperatorRecord(
      process.env.E2E_INDUSTRY_USER_GUID as string,
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("❌ Error in Db setup for profile roles:", error);
    throw error;
  }
});

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });
// ➰ Loop through the entries of UserRole enum
for (let [role, value] of Object.entries(UserRole)) {
  role = "E2E_" + role;
  const storageState = process.env[role + "_STORAGE"] as string;
  test.describe(`Test Dashboard for ${value}`, () => {
    // 👤 run test as this role
    test.use({ storageState: storageState });
    test("Test Selfie", async ({ page }, testInfo) => {
      // 🛸 Navigate to dashboard page
      const dashboardPage = new DashboardPOM(page);
      await dashboardPage.route();
      switch (value) {
        case UserRole.NEW_USER:
          // 🔍 Assert that the current URL ends with "/profile"
          const profilePage = new ProfilePOM(page);
          await profilePage.urlIsCorrect();
          break;
        default:
          // 🔍 Assert that the current URL ends with "/dashboard"
          await dashboardPage.urlIsCorrect();
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
          break;
      }
    });
  });
}

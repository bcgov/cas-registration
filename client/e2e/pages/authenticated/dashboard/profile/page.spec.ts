// 🧪 Suite to test `client/app/(authenticated)/dashboard/profile/page.tsx`

import { test } from "@playwright/test";
// 🪄 Page Object Models
import { DashboardPOM } from "@/e2e/poms/dashboard";
import { ProfilePOM } from "@/e2e/poms/profile";
// ☰ Enums
import { UserRole } from "@/e2e/utils/enums";
// 🥞 DB CRUD
import { deleteUserRecord, upsertUserRecord } from "@/e2e/utils/queries";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

// 📚 Declare a beforeAll hook that is executed once per worker process before all tests.
// 🥞 Set DB for profile update
/*
For industry_user:
- create user
For "new user":
-  delete record in the db so that on "new user" login the ID will have no app_role
*/
test.beforeAll(async () => {
  try {
    // 👤 upsert industry_user: bc-cas-dev-secondary
    await upsertUserRecord(UserRole.INDUSTRY_USER);
    // 👤 delete new user: bc-cas-dev-three
    await deleteUserRecord(process.env.E2E_NEW_USER_GUID as string);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("❌ Error in Db setup for profile roles:", error);
    throw error;
  }
});
// 📚 Declare an afterAll hook that is executed once per worker process after all tests.
/*
For "new user":
-  delete record created in "Test Profile for none\Test Update"
*/
test.afterAll(async () => {
  try {
    // Cleanup the environment for other tests
    // 👤 delete new user: bc-cas-dev-three
    await deleteUserRecord(process.env.E2E_NEW_USER_GUID as string);
  } catch (error) {
    throw error;
  }
});
// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });
// ➰ Loop through the entries of UserRole enum
for (let [role, value] of Object.entries(UserRole)) {
  // Ensures that certain roles are not tested in the current context
  if (
    value === UserRole.CAS_PENDING ||
    value === UserRole.CAS_ANALYST ||
    value === UserRole.INDUSTRY_USER_ADMIN
  ) {
    continue;
  }
  role = "E2E_" + role;
  const storageState = process.env[role + "_STORAGE"] as string;
  test.describe(`Test Profile for ${value}`, () => {
    // 👤 run test as this role
    test.use({ storageState: storageState });
    test("Test Update", async ({ page }) => {
      // 🛸 Navigate to profile page
      const profilePage = new ProfilePOM(page);
      await profilePage.route();
      // 🔍 Assert that the current URL
      await profilePage.urlIsCorrect();
      // 🔍 Assert profile update required fields
      await profilePage.updateFail();
      // 🔍 Assert profile update
      await profilePage.updateSuccess();
      switch (value) {
        case UserRole.NEW_USER:
          // 🔍 Assert that the current URL
          const dashboardPage = new DashboardPOM(page);
          await dashboardPage.urlIsCorrect();
          break;
      }
    });
  });
}

// 🧪 Suite to test `client/app/(authenticated)/dashboard/profile/page.tsx`

import { test } from "@playwright/test";
// 🪄 Page Object Models
import { DashboardPOM } from "@/e2e/poms/dashboard";
import { ProfilePOM } from "@/e2e/poms/profile";
// ☰ Enums
import { E2EValue, UserRole } from "@/e2e/utils/enums";
// 🥞 DB CRUD
import { deleteUserRecord } from "@/e2e/utils/queries";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

// 📚 Declare a beforeAll hook that is executed once per worker process before all tests.
// 🥞 Set DB for e2e login roles
/*
For "new user":
-  delete record in the db so that on "new user" login the ID will have no app_role
*/
test.beforeAll(async () => {
  try {
    // 👤 delete new user: bc-cas-dev-three
    await deleteUserRecord(process.env.E2E_NEW_USER_GUID as string);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("❌ Error in Db setup for profile by roles:", error);
    throw error;
  }
});

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });
test.describe("Test Profile Page", () => {
  // ➰ Loop through the entries of UserRole enum
  for (let [role, value] of Object.entries(UserRole)) {
    role = E2EValue.PREFIX + role;
    const storageState = JSON.parse(
      process.env[role + E2EValue.STORAGE] as string,
    );
    test.describe(`Test Role ${value}`, () => {
      // 👤 run test as this role
      test.use({ storageState: storageState });
      test("Test Update", async ({ page }) => {
        // 🛸 Navigate to profile page
        const profilePage = new ProfilePOM(page);
        await profilePage.route();
        // 🔍 Assert that the current URL
        await profilePage.urlIsCorrect();
        // 🔍 Assert profile update validates required fields
        await profilePage.updateFail();
        // 🔍 Assert profile update success
        await profilePage.updateSuccess();
        //🔍 Assert profile name reflects the updated user profile full name
        await profilePage.userFullNameIsCorrect(
          E2EValue.INPUT_PROFILE_USERNAME,
        );

        switch (value) {
          case UserRole.NEW_USER:
            // Init a dashboard POM
            const dashboardPage = new DashboardPOM(page);
            // 🔍 Assert the current URL for dashboard pom
            await dashboardPage.urlIsCorrect();
            break;
        }
      });
    });
  }
});

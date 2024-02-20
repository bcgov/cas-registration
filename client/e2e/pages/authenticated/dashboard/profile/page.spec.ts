// 🧪 Suite to test the authentication\profile

import { test } from "@playwright/test";
// 🪄 Page Object Models
import { DashboardPOM } from "@/e2e/poms/dashboard";
import { ProfilePOM } from "@/e2e/poms/profile";
// ☰ Enums
import { UserRole } from "@/e2e/utils/enums";
// 🥞 Connection pool to postgres DB
import { pool } from "@/e2e/utils/pool";
import { deleteUserNew, upsertUserIO } from "@/e2e/utils/queries";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

// 🛠️ Function: deletes the new user record from the database
const deleteNewUserRecord = async () => {
  try {
    const query = deleteUserNew;
    // Execute the deletion query
    await pool.query(query);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error deleting new user record:", error);
    throw error;
  }
};
// 📚 Declare a beforeAll hook that is executed once per worker process before all tests.
// 🥞 Set DB for profile update
// For industry_user, ensure there is an associated user
// For "new user" test, ensure there is NOT an associated "new user" record in the db so that on "new user" login the ID will have no app_role
test.beforeAll(async () => {
  try {
    // 👤 industry_user: bc-cas-dev-secondary
    // Upsert a User record
    let query = upsertUserIO;
    // ▶️ Execute the query
    await pool.query(query);

    // 👤 new user: bc-cas-dev-three
    // Delete User record
    await deleteNewUserRecord();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("❌ Error in Db setup for profile roles:", error);
    throw error;
  }
});

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });
test.describe("Test Page - Profile", () => {
  test.describe(`Test User Role`, () => {
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
      // 👤 run test as this role
      const storageState = process.env[role + "_STORAGE"] as string;
      test.use({ storageState: storageState });
      test(`Test Profile Update for ${role}`, async ({ page }) => {
        // 🛸 Navigate to profile page
        const profilePage = new ProfilePOM(page);
        await profilePage.route();
        // 🔍 Assert profile update required fields
        await profilePage.updateFail();
        // 🔍 Assert profile update
        await profilePage.updateSuccess();
        switch (value) {
          case UserRole.NEW_USER:
            // 🔍 Assert that the current URL ends with "/dashboard"
            const dashboardPage = new DashboardPOM(page);
            await dashboardPage.urlIsCorrect();
            break;
        }
      });
    }
  });
});

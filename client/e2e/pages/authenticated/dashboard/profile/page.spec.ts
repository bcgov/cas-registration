// 🧪 Suite to test the onboarding\Home page `http://localhost:3000/home`

import { test, expect } from "@playwright/test";
// 🪄 Page Object Models
import { DashboardPOM } from "@/e2e/poms/dashboard";
import { ProfilePOM } from "@/e2e/poms/profile";
// ☰ Enums
import { UserRole } from "@/e2e/utils/enums";
// 🥞 Connection pool to postgres DB
import { pool } from "@/e2e/utils/pool";
import { delete_new_user, upsert_industry_user } from "@/e2e/utils/queries";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });

// 📚 Declare a beforeAll hook that is executed once per worker process before all tests.
// 🥞 Set DB for profile update
// For industry_user, ensure there is an associated user
// For no role/new user, ensure there is NOT an associated user
test.beforeAll(async () => {
  try {
    // 👤 industry_user: bc-cas-dev-secondary
    // Upsert a User record
    let query = upsert_industry_user;
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

// 🛠️ Function: deletes the new user record from the database
const deleteNewUserRecord = async () => {
  try {
    const query = delete_new_user;
    // Execute the deletion query
    await pool.query(query);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error deleting new user record:", error);
    throw error;
  }
};

test.describe("Test Page - Profile", () => {
  // ➰ Loop through the entries of UserRole enum
  for (let [role, value] of Object.entries(UserRole)) {
    test.describe(`Test User Role - ${value}`, () => {
      // 👤 run test as this role
      role = "E2E_" + role;
      const storageState = process.env[role + "_STORAGE"] as string;
      test.use({ storageState: storageState });

      test("Test Profile Update", async ({ page }) => {
        // 🛸 Navigate to profile page
        const profilePage = new ProfilePOM(page);
        await profilePage.route();
        // 🔍 Assert profile update required fields
        await profilePage.updateFail();
        // 🔍 Assert profile update
        await profilePage.updateSuccess();
        // 🔍 Assert that the current URL is correct
        switch (value) {
          case UserRole.NEW_USER:
            // 🔍 Assert that the current URL ends with "/dashboard"
            const dashboardPage = new DashboardPOM(page);
            await dashboardPage.urlIsCorrect();
            await deleteNewUserRecord();
            break;
        }
      });
    });
  }
});

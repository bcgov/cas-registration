// 🧪 Suite to test `client/app/(authenticated)/dashboard/page.tsx`

import { test } from "@playwright/test";
// 🪄 Page Object Models
import { DashboardPOM } from "@/e2e/poms/dashboard";
import { ProfilePOM } from "@/e2e/poms/profile";
// ☰ Enums
import {
  AppRole,
  UserRole,
  UserOperatorStatus,
  E2EValue,
} from "@/e2e/utils/enums";
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
const happoPlaywright = require("happo-playwright");
// Helpers
import { analyzeAccessibility } from "@/e2e/utils/helpers";

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
    // Upsert a User record: bc-cas-dev-secondary
    await upsertUserRecord(UserRole.INDUSTRY_USER);
    await deleteUserOperatorRecord(
      process.env.E2E_INDUSTRY_USER_GUID as string,
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("❌ Error in Db setup for dashboard:", error);
    throw error;
  }
});

test.beforeEach(async ({ context }) => {
  await happoPlaywright.init(context);
});

test.afterEach(async () => {
  await happoPlaywright.finish();
});

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });
test.describe("Test Dashboard Page", () => {
  // ➰ Loop through the entries of UserRole enum
  for (let [role, value] of Object.entries(UserRole)) {
    role = E2EValue.PREFIX + role;
    const storageState = JSON.parse(
      process.env[role + E2EValue.STORAGE] as string,
    );
    test.describe(`Test Role ${value}`, () => {
      // 👤 run test as this role
      test.use({ storageState: storageState });
      test("Test Selfie", async ({ page }) => {
        const dashboardPage = new DashboardPOM(page);
        // 🛸 Navigate to dashboard page
        await dashboardPage.route();
        switch (value) {
          case UserRole.NEW_USER:
            // 🔍 Assert that the current URL ends with "/profile"
            await new ProfilePOM(page).urlIsCorrect();
            break;
          default:
            // 🔍 Assert that the current URL ends with "/dashboard"
            await dashboardPage.urlIsCorrect();
            break;
        }
      });
      test("Report a Problem Tile workflow", async ({ page }) => {
        // 📌 Skip roles: cas_pending; new user
        if (value !== UserRole.CAS_PENDING && value !== UserRole.NEW_USER) {
          // 🛸 Navigate to dashboard page
          const dashboardPage = new DashboardPOM(page);
          await dashboardPage.route();
          // 🔍 Assert  the current URL
          await dashboardPage.urlIsCorrect();
          // 🔍 Assert has a mailto: link on it
          await dashboardPage.problemLinkIsCorrect();
        }
      });
    });
  }
});

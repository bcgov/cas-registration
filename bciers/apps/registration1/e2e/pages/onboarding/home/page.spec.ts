// 🧪 Suite to test `client/app/(onboarding)/home/page.tsx`
import { test, expect } from "@playwright/test";
// 🪄 Page Object Models
import { DashboardPOM } from "@/e2e/poms/dashboard";
import { HomePOM } from "@/e2e/poms/home";
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
  deleteUserRecord,
  upsertUserRecord,
  upsertOperatorRecord,
  upsertUserOperatorRecord,
} from "@/e2e/utils/queries";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });
import happoPlaywright from "happo-playwright";
// Helpers
import { analyzeAccessibility } from "@/e2e/utils/helpers";

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


test.beforeEach(async ({ context }) => {
  await happoPlaywright.init(context);
});

test.afterEach(async () => {
  await happoPlaywright.finish();
});


  test.describe(`Test User Role`, () => {
    // ➰ Loop through the entries of UserRole enum
    for (let [role, value] of Object.entries(UserRole)) {
      test(`Test Login - ${value}`, async ({ page }) => {
        // 👤 Set user and password based on the user role
        let user = process.env.E2E_CAS_USER as string;
        let password = process.env.E2E_CAS_USER_PASSWORD as string;
        role = E2EValue.PREFIX + role;
        switch (value) {
          case UserRole.INDUSTRY_USER_ADMIN:
          case UserRole.INDUSTRY_USER:
          case UserRole.NEW_USER:
            user = process.env[`${role}`] || "";
            password = process.env[`${role}${E2EValue.PASSWORD}`] || "";
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
            // 🔍 Assert profile update success
            await profilePage.updateSuccess();
            break;
          default:
            // 🔍 Assert that the current URL ends with "/dashboard"
            await new DashboardPOM(page).urlIsCorrect();
            break;
        }
        // 🔍 Assert that the user has correct role
        const myRole =
          value === UserRole.NEW_USER ? UserRole.INDUSTRY_USER : value;
        await homePage.userRoleIsCorrect(myRole);
      });
    }
  });
});

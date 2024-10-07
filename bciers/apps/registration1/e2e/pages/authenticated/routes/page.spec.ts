import { test, expect } from "@playwright/test";
// 🪄 Page Object Models
import { DashboardPOM } from "@/e2e/poms/dashboard";
import { HomePOM } from "@/e2e/poms/home";
import { OperationPOM } from "@/e2e/poms/operation";
import { OperationsPOM } from "@/e2e/poms/operations";
import { OperatorPOM } from "@/e2e/poms/operator";
import { OperatorsPOM } from "@/e2e/poms/operators";
import { ProfilePOM } from "@/e2e/poms/profile";
import { UsersPOM } from "@/e2e/poms/users";
// ☰ Enums
import { AppRoute, DataTestID, E2EValue, UserRole } from "@/e2e/utils/enums";
import { appRouteRoles } from "@/e2e/utils/constants";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
import {
  deleteUserOperatorRecord,
  deleteUserRecord,
} from "@/e2e/utils/queries";
dotenv.config({ path: "./e2e/.env.local" });

// 📚 Declare a beforeAll hook that is executed once per worker process before all tests.
// 🥞 Set DB for route access
/*
For industry_user new
- delete user
For industry_user: create scenario for Operator Select\1 action pending
- delete user operator
*/
test.beforeAll(async () => {
  try {
    // 👤 delete new user: bc-cas-dev-three
    await deleteUserRecord(process.env.E2E_NEW_USER_GUID as string);
    // 👤 delete user operator
    await deleteUserOperatorRecord(
      process.env.E2E_INDUSTRY_USER_GUID as string,
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("❌ Error in Db setup for route:", error);
    throw error;
  }
});

// 🛠️ Function to build allow and deny lists based on current user role
function buildAccessLists(currentRole: UserRole): AppRoute[] {
  return Object.entries(appRouteRoles).reduce((acc, [route, allowedRoles]) => {
    if (allowedRoles.includes(currentRole)) {
      acc.push(route as AppRoute);
    }
    return acc;
  }, [] as AppRoute[]);
}

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });
test.describe("Test Route Access", () => {
  // ➰ Loop through the entries of UserRole enum
  for (let [role, value] of Object.entries(UserRole)) {
    role = E2EValue.PREFIX + role;
    const storageState = JSON.parse(
      process.env[role + E2EValue.STORAGE] as string,
    );
    test.describe(`Test Role ${value}`, () => {
      // 👤 Run test as this role
      test.use({ storageState: storageState });
    });
  }
});

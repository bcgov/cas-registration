import { Locator, test, expect } from "@playwright/test";
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
import {
  AppRoute,
  appRouteRoles,
  DataTestID,
  UserRole,
} from "@/e2e/utils/enums";
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
      process.env.E2E_INDUSTRY_USER_GUID as string
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
    role = "E2E_" + role;
    const storageState = JSON.parse(process.env[role + "_STORAGE"] as string);
    test.describe(`Test Role ${value}`, () => {
      // 👤 Run test as this role
      test.use({ storageState: storageState });
      // 🛸 Navigate to all routes
      for (let route of Object.values(AppRoute)) {
        test(`Test Route ${route}`, async ({ page }) => {
          // 🚨 Build routes allowed list for this user role
          const accessLists = buildAccessLists(value);
          // 🧩 Create instance of this route's POM
          let pomPage;
          switch (route) {
            case AppRoute.DASHBOARD:
              pomPage = new DashboardPOM(page);
              break;
            case AppRoute.HOME:
              pomPage = new HomePOM(page);
              break;
            case AppRoute.OPERATION:
              pomPage = new OperationPOM(page);
              break;
            case AppRoute.OPERATIONS:
              pomPage = new OperationsPOM(page);
              break;
            case AppRoute.OPERATOR:
              pomPage = new OperatorPOM(page);
              break;
            case AppRoute.OPERATORS:
              pomPage = new OperatorsPOM(page);
              break;
            case AppRoute.PROFILE:
              pomPage = new ProfilePOM(page);
              break;
            case AppRoute.USERS:
              pomPage = new UsersPOM(page);
              break;
          }
          if (pomPage) {
            // 🚨 Check if route is in the role's allow list
            const isAllowedRoute = accessLists.includes(route);
            // 🛸 Navigate to route
            await pomPage.route();
            // 📌 Some roles have exceptions to the expected results
            switch (value) {
              case UserRole.CAS_PENDING:
                // 👤 Authenticated cas_pending have no role; so, redirected to dashboard for all routes except `profile`
                if (route === AppRoute.PROFILE) {
                  // 🔍 Assert that the current URL ends with "/profile"
                  const profilePage = new ProfilePOM(page);
                  profilePage.urlIsCorrect();
                } else {
                  // 🔍 Assert that the current URL ends with "/dashboard"
                  const dashboardPage = new DashboardPOM(page);
                  dashboardPage.urlIsCorrect();
                }
                break;
              case UserRole.NEW_USER:
                // 👤 Authenticated new user is redirected to  `profile` for all routes
                // 🔍 Assert that the current URL ends with "/profile"
                const profilePage = new ProfilePOM(page);
                profilePage.urlIsCorrect();
                break;
              default:
                // 👤 All other roles, routing results are based on route accesibility
                if (isAllowedRoute) {
                  // 🔑 Accessible route, role has access
                  // 📌 Some routes have exceptions to the expected results
                  switch (route) {
                    case AppRoute.HOME:
                      // 👤 Authenticated users never get to home, redirected to dashboard
                      // 🔍 Assert that the current URL ends with "/dashboard"
                      const dashboardPage = new DashboardPOM(page);
                      dashboardPage.urlIsCorrect();
                      break;
                    default:
                      // 🛸 All other routes
                      // 🔍 Assert that the current URL is correct
                      await pomPage.urlIsCorrect();
                      // 🔍 Assert that the not-found selector is not available
                      const msgNotFound = page.locator(DataTestID.NOTFOUND);
                      // Wait for the selector to not be available
                      await expect(msgNotFound.waitFor({ state: "hidden" }));
                      break;
                  }
                } else {
                  // 🔒 Inaccessible route, role has no access
                  // 📌 Some role && routes have exceptions to the expected results
                  if (
                    value === UserRole.INDUSTRY_USER &&
                    (route === AppRoute.OPERATION ||
                      route === AppRoute.OPERATIONS)
                  ) {
                    // 👤 Authenticated INDUSTRY_USER with 1 action pending get redirected to dashboard
                    // 🔍 Assert that the current URL ends with "/dashboard"
                    const dashboardPage = new DashboardPOM(page);
                    dashboardPage.urlIsCorrect();
                  } else {
                    // 🔍 Assert that the role has NO access, not-found message is available
                    const msgNotFound = page.locator(DataTestID.NOTFOUND);
                    await expect(msgNotFound.waitFor({ state: "visible" }));
                  }
                }
                break;
            }
          }
        });
      }
    });
  }
});

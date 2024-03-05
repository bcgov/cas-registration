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
import {
  AppRole,
  AppRoute,
  appRouteRoles,
  DataTestID,
  UserOperatorStatus,
  UserOperatorUUID,
  UserRole,
} from "@/e2e/utils/enums";
// 🥞 DB CRUD
import {
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
For industry_user: allow access to route `dashboard/select-operator`
- create user
- create operator
- create user operator
*/
test.beforeAll(async () => {
  try {
    // Scenario FrontEndRoles.INDUSTRY_USER where UserOperatorStatus.APPROVED && OperatorStatus.APPROVED;
    // Upsert a User record: bc-cas-dev-secondary
    await upsertUserRecord(UserRole.INDUSTRY_USER);
    // Upsert an Operator record, using default values
    await upsertOperatorRecord();
    // Upsert an User Operator record: industry_user, operator id 2
    await upsertUserOperatorRecord(
      process.env.E2E_INDUSTRY_USER_GUID as string,
      AppRole.ADMIN,
      UserOperatorStatus.APPROVED,
      {
        id: UserOperatorUUID.INDUSTRY_USER,
      },
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("❌ Error in Db setup for routes:", error);
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
// ➰ Loop through the entries of UserRole enum
for (let [role, value] of Object.entries(UserRole)) {
  role = "E2E_" + role;
  const storageState = process.env[role + "_STORAGE"] as string;
  test.describe(`Test Route Access for ${value}`, () => {
    // 👤 run test as this role
    test.use({ storageState: storageState });
    test("Test Navigate to Routes", async ({ page }) => {
      // 🚨 Build user role's allow list
      const accessLists = buildAccessLists(value);
      // 🛸 Navigate to all routes
      for (let route of Object.values(AppRoute)) {
        // 🧩 Create instance of route's POM
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
          const isAllowedRoute = accessLists.includes(route);
          const timeOut = 11000;
          // eslint-disable-next-line no-console
          console.log(
            `🚀 Route ${route} for ${value} has access ${isAllowedRoute}`,
          );

          // 🛸 Navigate to route
          await pomPage.route();
          if (value === UserRole.CAS_PENDING) {
            // 👤 authenticated cas_pending have no role; so, redirected to dashboard...except for profile
            if (route === AppRoute.PROFILE) {
              // 🔍 Assert that the current URL ends with "/profile"
              const profilePage = new ProfilePOM(page);
              profilePage.urlIsCorrect();
            } else {
              // 🔍 Assert that the current URL ends with "/dashboard"
              const dashboardPage = new DashboardPOM(page);
              dashboardPage.urlIsCorrect();
            }
          } else {
            if (isAllowedRoute) {
              // 🔑 Accessible route
              if (route === AppRoute.HOME) {
                // 👤 authenticated users never get to home, redirected to dashboard
                // 🔍 Assert that the current URL ends with "/dashboard"
                const dashboardPage = new DashboardPOM(page);
                dashboardPage.urlIsCorrect();
              } else {
                // 🔍 Assert that the role has access
                await pomPage.urlIsCorrect();
                // Wait for the selector to not be available with a timeout
                await page.waitForSelector('[data-testid="not-found"]', {
                  state: "hidden",
                  timeout: timeOut,
                });
                // 🔍 Assert that the not-found selector is not available
                const notFoundSelector = await page.$(
                  '[data-testid="not-found"]',
                );
                expect(notFoundSelector).toBeFalsy();
              }
            } else {
              // 🔒 Inaccessible route
              // 🔍 Assert that the role has NO access, not-found selector is available
              await pomPage.page.waitForSelector(DataTestID.NOTFOUND, {
                timeout: timeOut,
              });
            }
          }
        }
      }
    });
  });
}

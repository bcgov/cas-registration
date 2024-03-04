import { test, expect } from "@playwright/test";
// 🪄 Page Object Models
import { DashboardPOM } from "@/e2e/poms/dashboard";
import { OperationPOM } from "@/e2e/poms/operation";
import { OperationsPOM } from "@/e2e/poms/operations";
import { OperatorPOM } from "@/e2e/poms/operator";
import { OperatorsPOM } from "@/e2e/poms/operators";
import { ProfilePOM } from "@/e2e/poms/profile";
import { UsersPOM } from "@/e2e/poms/users";
// ☰ Enums
import { AppRoute, UserRole } from "@/e2e/utils/enums";
// 🚨 Object literal policing route access by role
const appRouteRoles: Record<AppRoute, UserRole[]> = {
  [AppRoute.DASHBOARD]: [
    UserRole.CAS_PENDING,
    UserRole.CAS_ANALYST,
    UserRole.CAS_ADMIN,
    UserRole.INDUSTRY_USER,
    UserRole.INDUSTRY_USER_ADMIN,
  ],
  [AppRoute.HOME]: [
    UserRole.CAS_PENDING,
    UserRole.CAS_ANALYST,
    UserRole.CAS_ADMIN,
    UserRole.INDUSTRY_USER,
    UserRole.INDUSTRY_USER_ADMIN,
    UserRole.NEW_USER,
  ],
  [AppRoute.OPERATION]: [UserRole.INDUSTRY_USER, UserRole.INDUSTRY_USER_ADMIN],
  [AppRoute.OPERATIONS]: [
    UserRole.CAS_ANALYST,
    UserRole.CAS_ADMIN,
    UserRole.INDUSTRY_USER,
    UserRole.INDUSTRY_USER_ADMIN,
  ],
  [AppRoute.OPERATOR]: [UserRole.INDUSTRY_USER, UserRole.INDUSTRY_USER_ADMIN],
  [AppRoute.OPERATORS]: [UserRole.CAS_ANALYST, UserRole.CAS_ADMIN],
  [AppRoute.PROFILE]: [
    UserRole.CAS_PENDING,
    UserRole.CAS_ANALYST,
    UserRole.CAS_ADMIN,
    UserRole.INDUSTRY_USER,
    UserRole.INDUSTRY_USER_ADMIN,
    UserRole.NEW_USER,
  ],
  [AppRoute.USERS]: [UserRole.CAS_ADMIN, UserRole.INDUSTRY_USER_ADMIN],
};
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

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
      // 🚨 Build user role's allow and deny list
      const accessLists = buildAccessLists(value);
      // 🛸 Navigate to all routes
      for (let route of Object.values(AppRoute)) {
        let pomPage;
        switch (route) {
          case AppRoute.DASHBOARD:
            pomPage = new DashboardPOM(page);
            break;
          case AppRoute.HOME:
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
          // 🛸 Navigate to page
          await pomPage.route();
          // 🔍 Assert that the current URL role access
          const isAllowedRoute = accessLists.includes(route);
          const code = isAllowedRoute ? 500 : 404;
          // Listen for response status code
          page.on("response", async (response) => {
            // Add your expect test for the response status code
            expect(response.status()).toBe(code);
          });
        }
      }
    });
  });
}

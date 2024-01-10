// 🧪 Suite to test the Dashboard design for each user role
// Asserts the authenticated user has the correct role based navigation tiles

import { test, expect } from "@playwright/test";

// ℹ️ Environment variables are stored in `client/e2e/.env.local`
import * as dotenv from "dotenv";
dotenv.config({
  path: "./e2e/.env.local",
});

// 👤 User Roles
import { UserRole } from "../../utils/enums";

// 🔗 Import role-based dashboard navigation data
import casAdminDashboard from "@/app/data/dashboard/cas_admin.json";
import casAnalystDashboard from "@/app/data/dashboard/cas_analyst.json";
import industryUserDashboard from "@/app/data/dashboard/industry_user.json";
import industryUserAdminDashboard from "@/app/data/dashboard/industry_user_admin.json";

// 📐 Type: Dashboard Tiles JSON structure
type DashboardSection = {
  title: string;
  content: string;
  links: DashboardLink[];
};
// 📐 Type: DashboardLink
type DashboardLink = {
  title: string;
  href: string;
};

// Map user role to its respective dashboard data
const dashboardDataMap: Record<string, DashboardSection[]> = {
  [UserRole.CAS_ADMIN]: casAdminDashboard,
  [UserRole.CAS_ANALYST]: casAnalystDashboard,
  [UserRole.INDUSTRY_USER_ADMIN]: industryUserAdminDashboard,
  [UserRole.INDUSTRY_USER]: industryUserDashboard,
};

// Access the baseURL made available to proces.env from `client/e2e/setup/global.ts`
const { BASEURL } = process.env;
// set the test url
const url = BASEURL + "dashboard";

// 🛠️ Function: navigate to dashboard and validate section titles align with auth session user role
const assertDashboardNavigation = async (
  page: any,
  dashboardData: DashboardSection[]
) => {
  // Navigate to the dashboard
  await page.goto(url);
  // 🔍 Assert authenticated user's dashboard tiles title reflect role based dashboard json titles
  for (const section of dashboardData) {
    // Use Playwright selectors to find and validate section titles
    const titleSelector = `:is(h1, h2, h3, h4, h5, h6):has-text("${section.title}")`;
    // Use Playwright page.waitForSelector function to wait for an element to appear in the DOM
    expect(await page.waitForSelector(titleSelector)).toBeTruthy();
  }
  // 🔍 Assert authenticated user's dashboard tiles count reflect role based dashboard json count
  const cardContentSelector = '[data-testid="dashboard-nav-card"]';
  const cardContentElements = await page.$$(cardContentSelector);
  expect(cardContentElements.length).toBe(dashboardData.length);
};

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });

test.describe("Test Dashboard Page", () => {
  // ➰ Loop through the entries of UserRole enum
  for (const [role, value] of Object.entries(UserRole)) {
    const storageState = process.env[role + "_STORAGE"] || "";
    test.describe(`Test User Role - ${value}`, () => {
      test.use({ storageState: storageState });
      switch (value) {
        case UserRole.CAS_ADMIN:
        case UserRole.CAS_ANALYST:
        case UserRole.INDUSTRY_USER_ADMIN:
        case UserRole.INDUSTRY_USER:
          const dashboardData = dashboardDataMap[value];
          test("Test Navigation Tiles", async ({ page }) => {
            await assertDashboardNavigation(page, dashboardData);
          });
          break;
        case UserRole.CAS_PENDING:
          test("Test Pending Message", async ({ page }) => {
            await page.goto(url);
            // 🕒 Wait for the profile navigation link to be present
            const profileNavSelector = '[data-testid="nav-user-profile"]';
            await page.waitForSelector(profileNavSelector);
            // 🔍  Assert the authenticated user profile link is visible
            expect(await page.isVisible(profileNavSelector)).toBe(true);
            // 🕒 Wait for the pending message to be present
            const pendingMessageSelector =
              '[data-testid="dashboard-pending-message"]';
            await page.waitForSelector(pendingMessageSelector);
            // 🔍 Assert that pending message is visible
            expect(await page.isVisible(pendingMessageSelector)).toBe(true);
          });
          break;
        case UserRole.NEW_USER:
          test("Test New User Profile", async ({ page }) => {
            await page.goto(url);
            // New user has no role; so, redirected to: http://localhost:3000/dashboard/profile in `client/middlewares/withAuthorization.tsx`
            // 🕒 Wait for the navigation to complete
            await page.waitForLoadState("load");
            // 🔍 Assert that the current URL ends with "/profile"
            expect(page.url().toLocaleLowerCase()).toContain("/profile");
            // Try and navigate to Dashboard
            await page.getByRole("link", { name: "Dashboard" }).click();
            // 🕒 Wait for the navigation to complete
            await page.waitForLoadState("load");
            // 🔍 Assert that the current URL ends with "/profile"
            expect(page.url().toLocaleLowerCase()).toContain("/profile");
          });
          break;
      }
    });
  }
});

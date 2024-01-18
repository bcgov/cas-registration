// 🧪 Suite to test the Dashboard page `http://localhost:3000/dashboard`
// 🔍 Asserts the authenticated user has the correct role based navigation routes

import { test, expect } from "@playwright/test";

// ℹ️ Environment variables are stored in `client/e2e/.env.local`
import * as dotenv from "dotenv";
dotenv.config({
  path: "./e2e/.env.local",
});

// 👤 User Roles
import { UserRole } from "@/e2e/utils/enums";
// ⛏️ Helpers
import {
  navigateAndWaitForLoad,
  getDashboardDataMap,
  DashboardSection,
} from "@/e2e/utils/helpers";

// set the test url
const url = process.env.BASEURL + "dashboard";

// Get the dashboard navigation routes data by user role map
const dashboardDataMap = getDashboardDataMap();

// 🛠️ Function: navigates to dashboard and validates navigation titles align with the user's role dashboard json import
const assertDashboardNavigation = async (
  page: any,
  dashboardData: DashboardSection[],
) => {
  // 🛸 Navigate to the dashboard page
  await navigateAndWaitForLoad(page, url);
  // 🔍 Assert authenticated user's dashboard tiles title reflect role based dashboard json titles
  for (const section of dashboardData) {
    // Use Playwright selectors to find and validate section titles
    const titleSelector = `:is(h1, h2, h3, h4, h5, h6):has-text("${section.title}")`;
    // Use Playwright page.waitForSelector function to wait for an element to appear in the DOM
    expect(await page.waitForSelector(titleSelector)).toBeTruthy();
  }
  // 🔍 Assert authenticated user's dashboard tiles count reflect role based dashboard json object's count
  const cardContentSelector = '[data-testid="dashboard-nav-card"]';
  const cardContentElements = await page.$$(cardContentSelector);
  expect(cardContentElements.length).toBe(dashboardData.length);
};

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });

test.describe("Test Page - Dashboard", () => {
  // ➰ Loop through the entries of UserRole enum
  for (const [role, value] of Object.entries(UserRole)) {
    test.describe(`Test User Role - ${value}`, () => {
      // 👤 run test as this role
      const storageState = process.env[role + "_STORAGE"] || "";
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
            await navigateAndWaitForLoad(page, url);
            // 🕒 Wait for the pending message to be present
            const pendingMessageSelector =
              '[data-testid="dashboard-pending-message"]';
            await page.waitForSelector(pendingMessageSelector);
            // 🔍 Assert that pending message is visible
            expect(await page.isVisible(pendingMessageSelector)).toBe(true);
          });
          break;
        case UserRole.NEW_USER:
          test("Test Redirect To Profile", async ({ page }) => {
            await navigateAndWaitForLoad(page, url);
            // New user has no role; so, redirected to: http://localhost:3000/dashboard/profile in `client/middlewares/withAuthorization.tsx`
            // 🔍 Assert that the current URL ends with "/profile"
            expect(page.url().toLocaleLowerCase()).toContain("/profile");
          });
          break;
      }
    });
  }
});

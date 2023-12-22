import { test, expect } from "@playwright/test";
const { Pool } = require("pg");
// environment variables stored in client/e2e/.env.local
import * as dotenv from "dotenv";
dotenv.config({
  path: "./e2e/.env.local",
});

// State storage
const casAdminAuthFile = process.env.CAS_ADMIN_STORAGE || "";
const casAnalystAuthFile = process.env.CAS_ANALYST_STORAGE || "";
const casPendingAuthFile = process.env.CAS_PENDING_STORAGE || "";
const industryUserAuthFile = process.env.INDUSTRY_USER_STORAGE || "";
const industryUserAdminAuthFile = process.env.INDUSTRY_USER_ADMIN_STORAGE || "";
const newUserAuthFile = process.env.NEW_USER_STORAGE || "";

// Import role based dashboard navigation
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

type DashboardLink = {
  title: string;
  href: string;
};

// 🏷 Annotate entire file as serial.
test.describe.configure({ mode: "serial" });

// 🛠️ function: navigate to dashboard and validate section titles align with auth session role
const assertDashboardNavigation = async (
  page: any,
  dashboardData: DashboardSection[],
) => {
  // Navigate to the dashboard
  await page.goto("http://localhost:3000/dashboard");
  // 🔍 Assert authenticated user's dashboard tiles
  for (const section of dashboardData) {
    // Use Playwright selectors to find and validate section titles
    const titleSelector = `:is(h1, h2, h3, h4, h5, h6):has-text("${section.title}")`;
    // Use Playwright page.waitForSelector function to wait for an element to appear in the DOM
    expect(await page.waitForSelector(titleSelector)).toBeTruthy();
  }
  const cardContentSelector = '[data-testid="dashboard-nav-card"]';
  const cardContentElements = await page.$$(cardContentSelector);
  expect(cardContentElements.length).toBe(dashboardData.length);
};

test.describe("Test Dashboard", () => {
  test.describe("Test Auth Session - cas_admin", () => {
    const storageState = casAdminAuthFile;
    const dashboardData = casAdminDashboard;
    test.use({ storageState: storageState });
    test("Test Role Based UX", async ({ page }) => {
      await assertDashboardNavigation(page, dashboardData);
    });
  });
  test.describe("Test Auth Session - cas_analyst", () => {
    const storageState = casAnalystAuthFile;
    const dashboardData = casAnalystDashboard;
    test.use({ storageState: storageState });
    test("Test Role Based UX", async ({ page }) => {
      await assertDashboardNavigation(page, dashboardData);
    });
  });
  test.describe("Test Auth Session - cas_pending", () => {
    const storageState = casPendingAuthFile;
    test.use({ storageState: storageState });
    test("Test Role Based UX", async ({ page }) => {
      await page.goto("http://localhost:3000/dashboard");

      // Wait for the profile navigation link to be present
      const profileNavSelector = '[data-testid="nav-user-profile"]';
      await page.waitForSelector(profileNavSelector);

      // Assert that authenticated user profile link is visible
      expect(await page.isVisible(profileNavSelector)).toBe(true);

      // Wait for the pending message to be present
      const pendingMessageSelector =
        '[data-testid="dashboard-pending-message"]';
      await page.waitForSelector(pendingMessageSelector);

      // Assert that pending message is visible
      expect(await page.isVisible(pendingMessageSelector)).toBe(true);
    });
  });
  test.describe("Test Auth Session - industry_user", () => {
    const storageState = industryUserAuthFile;
    const dashboardData = industryUserDashboard;
    test.use({ storageState: storageState });
    test("Test Role Based UX", async ({ page }) => {
      await assertDashboardNavigation(page, dashboardData);
    });
  });
  test.describe("Test Auth Session - industry_user_admin", () => {
    const storageState = industryUserAdminAuthFile;
    const dashboardData = industryUserAdminDashboard;
    test.use({ storageState: storageState });
    test("Test Role Based UX", async ({ page }) => {
      await assertDashboardNavigation(page, dashboardData);
    });
  });
  test.describe("Test Auth Session - new user", () => {
    const storageState = newUserAuthFile;
    test.use({ storageState: storageState });
    test("Test Role Based UX", async ({ page }) => {
      await page.goto("http://localhost:3000/dashboard");
      // New user has no role; so, redirected to: http://localhost:3000/dashboard/profile

      // Wait for the navigation to complete
      await page.waitForLoadState("load");

      // Assert that the current URL ends with "/profile"
      expect(page.url().toLocaleLowerCase()).toContain("/profile");

      // Try and navigate to Dashboard
      await page.getByRole("link", { name: "Dashboard" }).click();

      // Wait for the navigation to complete
      await page.waitForLoadState("load");

      // Assert that the current URL ends with "/profile"
      expect(page.url().toLocaleLowerCase()).toContain("/profile");

      // Submit the user profile
      await page.getByLabel("Phone Number*").click();
      await page.getByLabel("Phone Number*").fill("1 234 567 8900");
      await page.getByLabel("Position Title*").click();
      await page.getByLabel("Position Title*").fill("Test");
      await page.getByRole("button", { name: "Submit" }).click();

      // Try and navigate to Dashboard
      await page.getByRole("link", { name: "Dashboard" }).click();

      // Wait for the navigation to complete
      await page.waitForLoadState("load");

      // Assert that the current URL ends with "/dashboard"
      expect(page.url().toLocaleLowerCase()).toContain("/dashboard");

      // Delete the new user record from the database
      const pool = new Pool({
        user: process.env.DB_USER,
        password: process.env.DB_USER_PASSWORD,
        host: "localhost",
        database: "registration",
        port: 5432,
      });
      await pool.query(
        "DELETE FROM erc.user where user_guid='c3cd84a8-e261-4814-93e1-5bd4a7ccd638'",
      );
      await pool.end();

      // Wait for the navigation to complete
      await page.waitForLoadState("load");

      // Assert that the current URL ends with "/profile"
      expect(page.url().toLocaleLowerCase()).toContain("/profile");
    });
  });
});

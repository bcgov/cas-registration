// 🧪 Suite to test the administration "industry_user_operator" (user with access to an operator) workflow
// tests that need fixture setup only once
import { test } from "@playwright/test";
// 🪄 Page Object Models
import { DashboardPOM } from "@/administration-e2e/poms/dashboard";
import { OperatorPOM } from "@/administration-e2e/poms/operator";
// ☰ Enums
import { AppRoute } from "@/administration-e2e/utils/enums";
import { AppName } from "@/administration-e2e/utils/constants";
import { UserRole } from "@bciers/e2e/utils/enums";
// 🛠️ Helpers
import {
  analyzeAccessibility,
  setupTestEnvironment,
} from "@bciers/e2e/utils/helpers";
const happoPlaywright = require("happo-playwright");

test.beforeAll(async () => {
  // Note: can run multiple times if using multiple workers (or, if a test fails you'll get a new worker- can't be helped)
  // So, ensure this runs only once by using only 1 worker
  // Setup fixtures for admin-industry_user
  await setupTestEnvironment(AppName + UserRole.INDUSTRY_USER + "_operator");
});

test.beforeEach(async ({ context }) => {
  await happoPlaywright.init(context);
});

test.afterEach(async () => {
  await happoPlaywright.finish();
});

// 🏷 Annotate test suite as serial so to use 1 worker- prevents failure in setupTestEnvironment
test.describe.configure({ mode: "serial" });
test.describe("Test operator paths with beforeAll", () => {
  // ➰ Loop through storage states
  const storageStates = [
    process.env.E2E_INDUSTRY_USER_STORAGE_STATE,
    process.env.E2E_INDUSTRY_USER_ADMIN_STORAGE_STATE,
  ];
  const storageRoles = [UserRole.INDUSTRY_USER, UserRole.INDUSTRY_USER_ADMIN];

  storageStates.forEach((state, index) => {
    const role = storageRoles[index];
    // 👤 run test using this storageState
    const storageState = JSON.parse(state as string);
    test.use({ storageState: storageState });
    test.describe(`Test Role ${role}`, () => {
      test("My operator link from dashboard", async ({ page }) => {
        // 🛸 Navigate to dashboard page
        const dashboardPage = new DashboardPOM(page);
        await dashboardPage.route();
        // 🔍 Assert current URL
        await dashboardPage.urlIsCorrect();
        // 🛸 Navigates to select operator
        await dashboardPage.clickOperatorTile();
        const operatorPage = new OperatorPOM(page);
        // 🔍 Assert current URL is select operator
        await operatorPage.urlIsCorrect(AppRoute.OPERATOR);
      });
      test("My operator form", async ({ page }) => {
        // 🛸 Navigates to select operator
        const operatorPage = new OperatorPOM(page);
        await operatorPage.route(AppRoute.OPERATOR);
        await operatorPage.urlIsCorrect(AppRoute.OPERATOR);
        // 🔍 Assert the form is visible - needed to prevent analyzeAccessibility from failing
        await operatorPage.formIsVisible();
        // 🔍 Assert the form is default read-only
        await operatorPage.formIsDisabled();
        // 📷 Cheese!
        const pageContent = page.locator("html");
        await happoPlaywright.screenshot(operatorPage.page, pageContent, {
          component: "Operator Form Page",
          variant: "read only",
        });
        // ♿️ Analyze accessibility
        await analyzeAccessibility(page);
      });
      test("My operator edit form", async ({ page }) => {
        // 🛸 Navigates to select operator
        const operatorPage = new OperatorPOM(page);
        await operatorPage.route(AppRoute.OPERATOR);
        // 🔍 Assert able to edit the operator form
        await operatorPage.clickEditInformation();
        await operatorPage.formIsEnabled();
        // 👉 Action edit operator form field(s)
        await operatorPage.editOperatorInformation();
        // 📷 Cheese!
        let pageContent = page.locator("html");
        await happoPlaywright.screenshot(operatorPage.page, pageContent, {
          component: "Operator Form Page",
          variant: "edit mode",
        });
        // ♿️ Analyze accessibility
        await analyzeAccessibility(page);
        // 🔍 Assert form is submitted
        await operatorPage.formIsSubmitted();
        // 📷 Cheese!
        pageContent = page.locator("html");
        await happoPlaywright.screenshot(operatorPage.page, pageContent, {
          component: "Operator Form Page",
          variant: "edit saved successfully",
        });
      });
    });
  });
});

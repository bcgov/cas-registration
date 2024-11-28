// 🧪 Suite to test the administration industry_user workflow
// tests that need fixture setup only once
import { test } from "@playwright/test";
// 🪄 Page Object Models
import { DashboardPOM } from "@/administration-e2e/poms/dashboard";
import { OperatorPOM } from "@/administration-e2e/poms/operator";
// ☰ Enums
import { OperatorE2EValue } from "@/administration-e2e/utils/enums";
import { AppRoute } from "@/administration-e2e/utils/enums";
import { AppName } from "@/administration-e2e/utils/constants";
import { UserRole } from "@bciers/e2e/utils/enums";
// 🛠️ Helpers
import {
  analyzeAccessibility,
  setupTestEnvironment,
  takeStabilizedScreenshot,
} from "@bciers/e2e/utils/helpers";
const happoPlaywright = require("happo-playwright");

test.beforeAll(async () => {
  // Note: can run multiple times if using multiple workers (or, if a test fails you'll get a new worker- can't be helped)
  // So, ensure this runs only once by using only 1 worker
  // Setup fixtures for admin-industry_user
  await setupTestEnvironment(AppName + "-" + UserRole.INDUSTRY_USER);
});

test.beforeEach(async ({ context }) => {
  await happoPlaywright.init(context);
});

test.afterEach(async () => {
  await happoPlaywright.finish();
});

// 🏷 Annotate test suite as serial so to use 1 worker- prevents failure in setupTestEnvironment
test.describe.configure({ mode: "serial" });
test.describe("Test select operator paths with beforeAll", () => {
  // 👤 run test using the storageState for this role
  const storageState = JSON.parse(
    process.env.E2E_INDUSTRY_USER_STORAGE_STATE as string,
  );
  test.use({ storageState: storageState });
  test("Select operator link from dashboard", async ({ page }) => {
    // 🛸 Navigate to dashboard page
    const dashboardPage = new DashboardPOM(page);
    debugger;
    await dashboardPage.route();
    // 🔍 Assert current URL
    await dashboardPage.urlIsCorrect();
    // 🛸 Navigates to select operator
    await dashboardPage.clickSelectOperatorTile();
    const selectOperatorPage = new OperatorPOM(page);
    // 🔍 Assert current URL is select operator
    await selectOperatorPage.urlIsCorrect(AppRoute.OPERATOR_SELECT);
    // 🔍 Assert the form is visible
    await selectOperatorPage.formIsVisible();
  });
  test("Select operator form", async ({ page }) => {
    // 🛸 Navigates to select operator
    const selectOperatorPage = new OperatorPOM(page);
    await selectOperatorPage.route(AppRoute.OPERATOR_SELECT);
    await selectOperatorPage.urlIsCorrect(AppRoute.OPERATOR_SELECT);
    // 🔍 Assert the form is visible - needed to prevent analyzeAccessibility from failing
    await selectOperatorPage.formIsVisible();
    // 📷 Cheese!
    let pageContent = page.locator("html");
    await happoPlaywright.screenshot(page, pageContent, {
      component: "Select operator form",
      variant: "default",
    });
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);
  });
  test("Select operator denied admin access request", async ({ page }) => {
    // 🛸 Navigates to select operator
    const selectOperatorPage = new OperatorPOM(page);
    await selectOperatorPage.route(AppRoute.OPERATOR_SELECT);
    await selectOperatorPage.urlIsCorrect(AppRoute.OPERATOR_SELECT);

    // 👉 Action select by CRA
    await selectOperatorPage.selectByCraNumber(
      OperatorE2EValue.SEARCH_CRA_DENIED_ADMIN,
    );
    // 🔍 Assert operator admin access denied
    await selectOperatorPage.msgRequestAccessAdminDeclinedIsVisible();
    // 📷 Cheese!
    let pageContent = page.locator("html");
    await happoPlaywright.screenshot(page, pageContent, {
      component: "Select operator admin access request declined",
      variant: "default",
    });
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);
  });
  test("Select operator denied non-admin access request", async ({ page }) => {
    // 🛸 Navigates to select operator
    const selectOperatorPage = new OperatorPOM(page);
    await selectOperatorPage.route(AppRoute.OPERATOR_SELECT);
    await selectOperatorPage.urlIsCorrect(AppRoute.OPERATOR_SELECT);

    // 👉 Action select by CRA
    await selectOperatorPage.selectByCraNumber(
      OperatorE2EValue.SEARCH_CRA_DENIED,
    );
    // 🔍 Assert operator access denied by admin message
    await selectOperatorPage.msgRequestAccessDeclinedIsVisible();
    // 📷 Cheese!
    let pageContent = page.locator("html");
    await happoPlaywright.screenshot(page, pageContent, {
      component: "Select operator non-admin access request declined",
      variant: "default",
    });
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);
  });
  test("Select operator Go back and Return navigations", async ({ page }) => {
    // 🛸 Navigate to select operator page
    const selectOperatorPage = new OperatorPOM(page);
    await selectOperatorPage.route(AppRoute.OPERATOR_SELECT);
    await selectOperatorPage.urlIsCorrect(AppRoute.OPERATOR_SELECT);
    // 👉 Action select by CRA
    await selectOperatorPage.selectByCraNumber(OperatorE2EValue.SEARCH_CRA);
    // 🔍 Assert operator confirmation message
    await selectOperatorPage.msgConfirmOperatorIsVisible();
    // 👉 Action accept operator
    await selectOperatorPage.acceptOperator();
    // 🔍 Assert no access message
    await selectOperatorPage.msgNoAccessIsVisible();
    // 👉 Action route go back
    await selectOperatorPage.routeBack();
    // 🔍 Assert operator confirmation message
    await selectOperatorPage.msgConfirmOperatorIsVisible();
    // 👉 Action route return
    await selectOperatorPage.routeReturn();
    // 🔍 Assert operator confirmation message
    await selectOperatorPage.msgSelectOpertorIsVisible();
  });
  test("My operator path not accessible", async ({ page }) => {
    // 🛸 Navigate to select operator page
    const selectOperatorPage = new OperatorPOM(page);
    await selectOperatorPage.route(AppRoute.OPERATOR);
    await selectOperatorPage.urlIsCorrect(AppRoute.OPERATOR);

    // 🔍 Assert operator not available
    await selectOperatorPage.hasOperatorAccess(UserRole.INDUSTRY_USER);
  });
  test("Add operator link from select operator", async ({ page }) => {
    // 🛸 Navigates to select operator
    const selectOperatorPage = new OperatorPOM(page);
    await selectOperatorPage.route(AppRoute.OPERATOR_SELECT);
    await selectOperatorPage.urlIsCorrect(AppRoute.OPERATOR_SELECT);

    // 👉 Action add a new operator
    await selectOperatorPage.clickAddOperator();
    // 🔍 Assert the form is visible
    await selectOperatorPage.formIsVisible();
  });
  test("Add operator form", async ({ page }) => {
    // 🛸 Navigates to add operator
    const selectOperatorPage = new OperatorPOM(page);
    await selectOperatorPage.route(AppRoute.OPERATOR_ADD);
    await selectOperatorPage.urlIsCorrect(AppRoute.OPERATOR_ADD);

    // 🔍 Assert the form is visible
    await selectOperatorPage.formIsVisible();
    // 🔍 Assert the form headers
    await selectOperatorPage.formHasHeaders();
    // 📷 Cheese!
    let pageContent = page.locator("html");
    await happoPlaywright.screenshot(page, pageContent, {
      component: "Add operator form",
      variant: "default",
    });
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);
  });
  test("Add operator form required fields", async ({ page }) => {
    // 🛸 Navigates to add operator
    const selectOperatorPage = new OperatorPOM(page);
    await selectOperatorPage.route(AppRoute.OPERATOR_ADD);

    // 👉 Action trigger form required fields errors
    await selectOperatorPage.triggerErrorsFieldRequired();
    // 📷 Cheese!
    await takeStabilizedScreenshot(happoPlaywright, page, {
      component: "Add operator form",
      variant: "required errors",
    });
  });
  test("Add operator form required fields formats", async ({ page }) => {
    // 🛸 Navigates to add operator
    const selectOperatorPage = new OperatorPOM(page);
    await selectOperatorPage.route(AppRoute.OPERATOR_ADD);
    // 👉 Action trigger form fields format errors
    await selectOperatorPage.triggerErrorsFieldFormat();
    // 📷 Cheese!
    await takeStabilizedScreenshot(happoPlaywright, page, {
      component: "Add operator form",
      variant: "format errors",
    });
  });
});

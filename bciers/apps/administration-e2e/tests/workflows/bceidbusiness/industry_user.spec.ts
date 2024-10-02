// 🧪 Suite to test the industry_user workflows using storageState

import { test } from "@playwright/test";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
// 🪄 Page Object Models
import { DashboardPOM } from "@/administration/e2e/poms/dashboard";
import { OperatorPOM } from "@/administration/e2e/poms/operator";
// ☰ Enums
import { AppRoute, E2EValue } from "@/administration/e2e/utils/enums";
import { UserRole } from "@/e2e/utils/enums";
// 🛠️ Helpers
import {
  analyzeAccessibility,
  setupTestEnvironment,
  takeStabilizedScreenshot,
} from "@/e2e/utils/helpers";
dotenv.config({ path: "./e2e/.env.local" });
const happoPlaywright = require("happo-playwright");
const appName = "admin";
test.beforeEach(async ({ context }) => {
  await happoPlaywright.init(context);

  await setupTestEnvironment(appName + "-" + UserRole.INDUSTRY_USER);
});

test.afterEach(async () => {
  await happoPlaywright.finish();
});

// 🏷 Annotate test suite as serial to prevent failure in setupTestEnvironment
test.describe.configure({ mode: "serial" });
test.describe("Test Workflow industry_user", () => {
  // 👤 run test using the storageState for this role
  const storageState = JSON.parse(
    process.env.E2E_INDUSTRY_USER_STORAGE_STATE as string,
  );
  test.use({ storageState: storageState });
  test("Select operator link from dashboard", async ({ page }) => {
    let pageContent;
    // 🛸 Navigate to dashboard page
    const dashboardPage = new DashboardPOM(page);
    await dashboardPage.route();
    // 🔍 Assert current URL
    await dashboardPage.urlIsCorrect();
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);
    // 🛸 Navigates to select operator
    await dashboardPage.clickSelectOperatorTile();
    const selectOperatorPage = new OperatorPOM(page);
    // 🔍 Assert current URL is select operator
    await selectOperatorPage.urlIsCorrect(AppRoute.OPERATOR_SELECT);
    // 🔍 Assert the form is visible - needed to prevent analyzeAccessibility from failing
    await selectOperatorPage.formIsVisible();
    // 📷 Cheese!
    await takeStabilizedScreenshot(happoPlaywright, page, {
      component: "Select operator form",
      variant: "default",
    });
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);
  });
  test("Select operator (via legal name) and request admin access", async ({
    page,
  }) => {
    let pageContent;
    // 🛸 Navigates to select operator
    const selectOperatorPage = new OperatorPOM(page);
    await selectOperatorPage.route(AppRoute.OPERATOR_SELECT);
    await selectOperatorPage.urlIsCorrect(AppRoute.OPERATOR_SELECT);

    // 👉 Action search by legal name
    await selectOperatorPage.selectByLegalName(
      E2EValue.SEARCH_LEGAL_NAME,
      E2EValue.FIXTURE_LEGAL_NAME,
    );
    // 🔍 Assert operator confirmation message
    await selectOperatorPage.msgConfirmOperatorIsVisible();

    // 📷 Cheese!
    // pageContent = page.locator("html");
    // await happoPlaywright.screenshot(page, pageContent, {
    //   component: "Select operator confirmation message",
    //   variant: "default",
    // });
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);

    // 👉 Action accept operator
    await selectOperatorPage.acceptOperator();
    // 🔍 Assert no administrator set up message
    await selectOperatorPage.msgNoAdminSetupIsVisible();
    // 📷 Cheese!
    // pageContent = page.locator("html");
    // await happoPlaywright.screenshot(page, pageContent, {
    //   component: "Select operator no administrator message",
    //   variant: "default",
    // });
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);

    // 👉 Action request administrator access
    await selectOperatorPage.requestAccessAdmin();
    // 🔍 Assert admin access requested message
    await selectOperatorPage.msgRequestAccessAdminConfirmedIsVisible();
    // 📷 Cheese!
    // pageContent = page.locator("html");
    // await happoPlaywright.screenshot(page, pageContent, {
    //   component: "Select operator admin access request confirmation",
    //   variant: "default",
    // });
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);
  });

  test("Select operator (via CRA business number) and request non-admin access", async ({
    page,
  }) => {
    let pageContent;

    // 🛸 Navigates to select operator
    const selectOperatorPage = new OperatorPOM(page);
    await selectOperatorPage.route(AppRoute.OPERATOR_SELECT);
    await selectOperatorPage.urlIsCorrect(AppRoute.OPERATOR_SELECT);

    // 👉 Action select by CRA
    await selectOperatorPage.selectByCraNumber(E2EValue.SEARCH_CRA);
    // 🔍 Assert operator confirmation message
    await selectOperatorPage.msgConfirmOperatorIsVisible();
    // 👉 Action accept operator
    await selectOperatorPage.acceptOperator();
    // 🔍 Assert no access message
    await selectOperatorPage.msgNoAccessIsVisible();
    // 📷 Cheese!
    // pageContent = page.locator("html");
    // await happoPlaywright.screenshot(page, pageContent, {
    //   component: "Select operator existing admin message",
    //   variant: "default",
    // });
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);
    // 👉 Action request access
    await selectOperatorPage.requestAccess();
    // 🔍 Assert non-admin access requested message
    await selectOperatorPage.msgRequestAccessConfirmedIsVisible();
    // 📷 Cheese!
    // pageContent = page.locator("html");
    // await happoPlaywright.screenshot(page, pageContent, {
    //   component: "Select operator non-admin access request confirmation",
    //   variant: "default",
    // });
  });
  test("Select operator denied request admin access", async ({ page }) => {
    let pageContent;

    // 🛸 Navigates to select operator
    const selectOperatorPage = new OperatorPOM(page);
    await selectOperatorPage.route(AppRoute.OPERATOR_SELECT);
    await selectOperatorPage.urlIsCorrect(AppRoute.OPERATOR_SELECT);

    // 👉 Action select by CRA
    await selectOperatorPage.selectByCraNumber(
      E2EValue.SEARCH_CRA_DENIED_ADMIN,
    );
    // 🔍 Assert operator admin access denied
    await selectOperatorPage.msgRequestAccessAdminDeclinedIsVisible();
    // 📷 Cheese!
    // pageContent = page.locator("html");
    // await happoPlaywright.screenshot(page, pageContent, {
    //   component: "Select operator admin access request declined",
    //   variant: "default",
    // });
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);
  });
  test("Select operator denied request non-admin access", async ({ page }) => {
    let pageContent;

    // 🛸 Navigates to select operator
    const selectOperatorPage = new OperatorPOM(page);
    await selectOperatorPage.route(AppRoute.OPERATOR_SELECT);
    await selectOperatorPage.urlIsCorrect(AppRoute.OPERATOR_SELECT);

    // 👉 Action select by CRA
    await selectOperatorPage.selectByCraNumber(E2EValue.SEARCH_CRA_DENIED);
    // 🔍 Assert operator access denied by admin message
    await selectOperatorPage.msgRequestAccessDeclinedIsVisible();
    // 📷 Cheese!
    // pageContent = page.locator("html");
    // await happoPlaywright.screenshot(page, pageContent, {
    //   component: "Select operator non-admin access request declined",
    //   variant: "default",
    // });
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);
  });

  test("Select operator Go back and Return navigations", async ({ page }) => {
    // 🛸 Navigate to select operator page
    const selectOperatorPage = new OperatorPOM(page);
    await selectOperatorPage.route(AppRoute.OPERATOR_SELECT);
    await selectOperatorPage.urlIsCorrect(AppRoute.OPERATOR_SELECT);
    // 👉 Action select by CRA
    await selectOperatorPage.selectByCraNumber(E2EValue.SEARCH_CRA);
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
  test("My operator path is not accessible", async ({ page }) => {
    // 🛸 Navigate to select operator page
    const selectOperatorPage = new OperatorPOM(page);
    await selectOperatorPage.route(AppRoute.OPERATOR);
    await selectOperatorPage.urlIsCorrect(AppRoute.OPERATOR);

    // 🔍 Assert operator not available
    await selectOperatorPage.hasOperatorAccess(UserRole.INDUSTRY_USER);
  });
  test("Add operator form submit", async ({ page }) => {
    let pageContent;

    // 🛸 Navigates to select operator
    const selectOperatorPage = new OperatorPOM(page);
    await selectOperatorPage.route(AppRoute.OPERATOR_SELECT);
    await selectOperatorPage.urlIsCorrect(AppRoute.OPERATOR_SELECT);

    // 👉 Action add a new operator
    await selectOperatorPage.clickAddOperator();
    // 🔍 Assert the form is visible
    await selectOperatorPage.formIsVisible();
    // 🔍 Assert the form headers
    await selectOperatorPage.formHasHeaders();
    // 📷 Cheese!
    // pageContent = page.locator("html");
    // await happoPlaywright.screenshot(page, pageContent, {
    //   component: "Add operator form",
    //   variant: "default",
    // });
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);
    // 👉 Action trigger form required fields errors
    await selectOperatorPage.triggerErrorsFieldRequired();
    // 📷 Cheese!
    // await takeStabilizedScreenshot(happoPlaywright, page, {
    //   component: "Add operator form",
    //   variant: "required errors",
    // });
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);

    // 👉 Action trigger form fields format errors
    await selectOperatorPage.triggerErrorsFieldFormat();
    // 📷 Cheese!
    // await takeStabilizedScreenshot(happoPlaywright, page, {
    //   component: "Add operator form",
    //   variant: "format errors",
    // });
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);

    // 👉 Action fill all operator form fields
    await selectOperatorPage.fillRequiredInformation();

    // 🔍 Assert New Operator request form is submitted
    await selectOperatorPage.formIsSubmitted();
    // 📷 Cheese!
    pageContent = page.locator("html");
    // await happoPlaywright.screenshot(page, pageContent, {
    //   component: "New operator confirmation",
    //   variant: "default",
    // });
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);
  });
});

// 🧪 Suite to test the industry_user workflows using storageState

import { test } from "@playwright/test";
// 🪄 Page Object Models
import { DashboardPOM } from "@/admin/e2e/poms/dashboard";
import { OperatorPOM } from "@/admin/e2e/poms/operator";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
// ☰ Enums
import { AppRoute, E2EValue } from "@/admin/e2e/utils/enums";
import { UserRole } from "@/e2e/utils/enums";
// 🛠️ Helpers
import {
  analyzeAccessibility,
  setupTestEnvironment,
  takeStabilizedScreenshot,
} from "@/e2e/utils/helpers";
import { deleteUserOperatorRecord } from "@/e2e/utils/queries";
dotenv.config({ path: "./e2e/.env.local" });
const happoPlaywright = require("happo-playwright");

test.beforeEach(async ({ context }) => {
  await happoPlaywright.init(context);

  await setupTestEnvironment(UserRole.INDUSTRY_USER);
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
  test("Administration Dashboard - Select Operator", async ({ page }) => {
    let pageContent;
    // 🛸 Navigate to dashboard page
    const dashboardPage = new DashboardPOM(page);
    await dashboardPage.route();
    // 🔍 Assert current URL
    await dashboardPage.urlIsCorrect();
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);
    // 📷 Cheese!
    pageContent = page.locator("html");
    await happoPlaywright.screenshot(page, pageContent, {
      component: "Administration Dashboard",
      variant: "default",
    });
    // 🛸 Navigates to select operator
    await dashboardPage.clickSelectOperatorTile();
    const selectOperatorPage = new OperatorPOM(page);
    // 🔍 Assert current URL is select operator
    await selectOperatorPage.urlIsCorrect(AppRoute.OPERATOR_SELECT);
    // 🔍 Assert the form is visible - needed to prevent analyzeAccessibility from failing
    await selectOperatorPage.formIsVisible();
    // 📷 Cheese!
    await takeStabilizedScreenshot(happoPlaywright, page, {
      component: "Select operator page",
      variant: "default",
    });
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);
  });
  test("Select existing operator (via legal name) and request admin access", async ({
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
    await selectOperatorPage.msgConfirmationIsVisible();

    // 📷 Cheese!
    pageContent = page.locator("html");
    await happoPlaywright.screenshot(page, pageContent, {
      component: "Select operator confirmation message",
      variant: "default",
    });
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);

    // 👉 Action accept operator
    await selectOperatorPage.acceptOperator();
    // 🔍 Assert no administrator set up message
    await selectOperatorPage.msgNoAdminSetupIsVisible();
    // 📷 Cheese!
    pageContent = page.locator("html");
    await happoPlaywright.screenshot(page, pageContent, {
      component: "Select operator no administrator message",
      variant: "default",
    });
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);

    // 👉 Action request administrator access
    await selectOperatorPage.requestAdmin();
    // 🔍 Assert access requested message
    await selectOperatorPage.msgAdminRequestedIsVisible();
    // 📷 Cheese!
    pageContent = page.locator("html");
    await happoPlaywright.screenshot(page, pageContent, {
      component: "Select operator admin access request confirmation",
      variant: "default",
    });
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);
  });

  test("Select existing operator (via CRA business number) and request non-admin access", async ({
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
    await selectOperatorPage.msgConfirmationIsVisible();
    // 👉 Action accept operator
    await selectOperatorPage.acceptOperator();
    // 🔍 Assert no access message
    await selectOperatorPage.msgNoAccessIsVisible();
    // 📷 Cheese!
    pageContent = page.locator("html");
    await happoPlaywright.screenshot(page, pageContent, {
      component: "Select operator existing admin message",
      variant: "default",
    });
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);
    // 👉 Action request access
    // await selectOperatorPage.requestAccess();
    // // 🔍 Assert access requested message
    // await selectOperatorPage.msgAccessRequestedIsVisible();
    // // 📷 Cheese!
    // pageContent = page.locator("html");
    // await happoPlaywright.screenshot(page, pageContent, {
    //   component: "Select operator non-admin access request confirmation",
    //   variant: "default",
    // });
  });
});

// 🧪 Suite to test the administration industry_user workflow - happy paths

import { test } from "@playwright/test";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
// 🪄 Page Object Models
import { OperatorPOM } from "@/administration/e2e/poms/operator";
// ☰ Enums
import { AppRoute, E2EValue } from "@/administration/e2e/utils/enums";
import { UserRole } from "@/e2e/utils/enums";
import { AppName } from "@/administration/e2e/utils/constants";

// 🛠️ Helpers
import {
  analyzeAccessibility,
  setupTestEnvironment,
} from "@/e2e/utils/helpers";
dotenv.config({ path: "./e2e/.env.local" });
const happoPlaywright = require("happo-playwright");

test.beforeEach(async ({ context }) => {
  await happoPlaywright.init(context);
  // Setup fixtures for admin-industry_user
  await setupTestEnvironment(AppName + "-" + UserRole.INDUSTRY_USER);
});

test.afterEach(async () => {
  await happoPlaywright.finish();
});

// 🏷 Annotate test suite as serial to prevent failure in setupTestEnvironment
test.describe.configure({ mode: "serial" });
test.describe("Test select operator happy paths", () => {
  // 👤 run test using the storageState for this role
  const storageState = JSON.parse(
    process.env.E2E_INDUSTRY_USER_STORAGE_STATE as string,
  );
  test.use({ storageState: storageState });
  test("Add operator form required fields submit", async ({ page }) => {
    // 🛸 Navigates to add operator
    const selectOperatorPage = new OperatorPOM(page);
    await selectOperatorPage.route(AppRoute.OPERATOR_ADD);
    // 👉 Action fill all operator form fields
    await selectOperatorPage.fillRequiredInformation();
    // 🔍 Assert New Operator request form is submitted
    await selectOperatorPage.formIsSubmitted();
    // 📷 Cheese!
    let pageContent = page.locator("html");
    await happoPlaywright.screenshot(page, pageContent, {
      component: "Add operator form",
      variant: "successful submission",
    });
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);
  });

  test("Select operator request admin access (via legal name)", async ({
    page,
  }) => {
    // 🛸 Navigates to select operator
    const selectOperatorPage = new OperatorPOM(page);
    await selectOperatorPage.route(AppRoute.OPERATOR_SELECT);
    await selectOperatorPage.urlIsCorrect(AppRoute.OPERATOR_SELECT);

    // 👉 Action search by legal name
    await selectOperatorPage.selectByLegalName(
      E2EValue.SEARCH_LEGAL_NAME,
      E2EValue.FIXTURE_LEGAL_NAME,
    );
    // 👉 Action accept operator
    await selectOperatorPage.acceptOperator();
    // 👉 Action request administrator access
    await selectOperatorPage.requestAccessAdmin();
    // 🔍 Assert admin access requested message
    await selectOperatorPage.msgRequestAccessAdminConfirmedIsVisible();
    // 📷 Cheese!
    let pageContent = page.locator("html");
    await happoPlaywright.screenshot(page, pageContent, {
      component: "Select operator admin access request confirmation",
      variant: "default",
    });
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);

    // 🛸 Navigates to select operator
    await selectOperatorPage.route(AppRoute.OPERATOR_SELECT);
    // 🔍 Assert admin access requested message
    await selectOperatorPage.msgRequestAccessAdminConfirmedIsVisible();
  });

  test("Select operator request non-admin access (via CRA business number)", async ({
    page,
  }) => {
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
    // 👉 Action request access
    await selectOperatorPage.requestAccess();
    // 🔍 Assert non-admin access requested message
    await selectOperatorPage.msgRequestAccessConfirmedIsVisible();
    // 📷 Cheese!
    let pageContent = page.locator("html");
    await happoPlaywright.screenshot(page, pageContent, {
      component: "Select operator non-admin access request confirmation",
      variant: "default",
    });

    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);

    // 🛸 Navigates to select operator
    await selectOperatorPage.route(AppRoute.OPERATOR_SELECT);
    // 🔍 Assert non-admin access requested message
    await selectOperatorPage.msgRequestAccessConfirmedIsVisible();
  });
});

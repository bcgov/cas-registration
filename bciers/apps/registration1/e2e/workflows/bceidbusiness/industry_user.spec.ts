// 🧪 Suite to test the industry_user workflows using storageState

import { test } from "@playwright/test";
// 🪄 Page Object Models
import { DashboardPOM } from "@/e2e/poms/dashboard";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
import { OperatorPOM } from "@/e2e/poms/operator";
import { deleteUserOperatorRecord } from "@/e2e/utils/queries";
import { E2EValue, FormField, UserRole } from "@/e2e/utils/enums";
// Helpers
import {
  analyzeAccessibility,
  setupTestEnvironment,
  takeStabilizedScreenshot,
} from "@/e2e/utils/helpers";
dotenv.config({ path: "./e2e/.env.local" });
const happoPlaywright = require("happo-playwright");

test.beforeEach(async ({ context }) => {
  await happoPlaywright.init(context);
  await setupTestEnvironment(UserRole.INDUSTRY_USER);
  await deleteUserOperatorRecord(process.env.E2E_INDUSTRY_USER_GUID as string);
});

test.afterEach(async () => {
  await happoPlaywright.finish();
});

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });
test.describe("Test Workflow industry_user", () => {
  // 👤 run test using the storageState for this role
  const storageState = JSON.parse(
    process.env.E2E_INDUSTRY_USER_STORAGE_STATE as string,
  );
  // Note: specify storageState for each test file or test group, instead of setting it in the config. https://playwright.dev/docs/next/auth#reuse-signed-in-state
  test.use({ storageState: storageState }); // this will error if no such file or directory

  test("Select existing operator (via legal name) and request admin access", async ({
    page,
  }) => {
    let pageContent;
    // 🛸 Navigate to dashboard page
    const dashboardPage = new DashboardPOM(page);
    const selectOperatorPage = new OperatorPOM(page);
    await dashboardPage.route();
    // 🔍 Assert current URL
    await dashboardPage.urlIsCorrect();
    // 🛸 Navigates to select operator
    await dashboardPage.clickSelectOperatorTile();
    // 🔍 Assert current URL is select operator
    await selectOperatorPage.urlIsCorrect();
    // 🔍 Assert the form is visible - needed to prevent analyzeAccessibility from failing
    await selectOperatorPage.formIsVisible();

    await takeStabilizedScreenshot(happoPlaywright, page, {
      component: "Select operator page",
      variant: "default",
    });

    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);
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
    // 🛸 Navigate directly to the operator page (already tested navigating from the dashboard in the first test)
    const selectOperatorPage = new OperatorPOM(page);
    await selectOperatorPage.route();
    // 🔍 Assert current URL
    await selectOperatorPage.urlIsCorrect();
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
    await selectOperatorPage.requestAccess();
    // 🔍 Assert access requested message
    await selectOperatorPage.msgAccessRequestedIsVisible();
    // 📷 Cheese!
    pageContent = page.locator("html");
    await happoPlaywright.screenshot(page, pageContent, {
      component: "Select operator non-admin access request confirmation",
      variant: "default",
    });
  });

  test("Add a new operator with parent operators", async ({ page }) => {
    let pageContent;
    // 🛸 Navigate directly to the operator page (already tested navigating from the dashboard in the first test)
    const selectOperatorPage = new OperatorPOM(page);
    await selectOperatorPage.route();
    // 🔍 Assert current URL
    await selectOperatorPage.urlIsCorrect();
    // 👉 Action create a new operator
    await selectOperatorPage.clickAddOperator();
    // 🔍 Assert the form is visible
    await selectOperatorPage.formIsVisible();
    // 🔍 Assert the form title is visible
    await selectOperatorPage.formTitleIsVisible();
    // 🔍 Assert edit information message is not visible
    //  await selectOperatorPage.msgEditInformationIsNotVisible();
    // 📷 Cheese!
    pageContent = page.locator("html");
    await happoPlaywright.screenshot(page, pageContent, {
      component: "Add a new operator",
      variant: "default",
    });
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);
    // 👉 Action trigger form required fields errors
    await selectOperatorPage.triggerErrorsFieldRequired();
    // 📷 Cheese!

    await takeStabilizedScreenshot(happoPlaywright, page, {
      component: "Add a new operator",
      variant: "required errors",
    });
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);

    // 👉 Action trigger form fields format errors
    await selectOperatorPage.triggerErrorsFieldFormat();
    // 📷 Cheese!

    await takeStabilizedScreenshot(happoPlaywright, page, {
      component: "Add a new operator",
      variant: "format errors",
    });
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);
    // 👉 Action fill all operator form fields
    await selectOperatorPage.fillInformation(FormField.FIELDSET_OPERATOR);
    // 👉 Action fill parent operation form fields - first section
    await selectOperatorPage.fieldHasParentCompany.check();
    await selectOperatorPage.fillInformation(
      FormField.FIELDSET_PARENT_COMPANY_0,
    );
    // 👉 Action fill parent operation form fields - second section
    await selectOperatorPage.buttonAddParentCompany.click();
    await selectOperatorPage.fillInformation(
      FormField.FIELDSET_PARENT_COMPANY_1,
    );
    // 📷 Cheese!
    await takeStabilizedScreenshot(happoPlaywright, page, {
      component: "Add a new operator",
      variant: "filled",
    });
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);
    // 🔍 Assert New Operator request form is submitted
    await selectOperatorPage.formIsSubmitted();
    // 📷 Cheese!
    pageContent = page.locator("html");
    await happoPlaywright.screenshot(page, pageContent, {
      component: "New operator confirmation",
      variant: "default",
    });
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);
  });

  test("Go back and return navigation works", async ({ page }) => {
    // 🛸 Navigate directly to the operator page (already tested navigating from the dashboard in the first test)
    const selectOperatorPage = new OperatorPOM(page);
    await selectOperatorPage.route();
    // 🔍 Assert current URL
    await selectOperatorPage.urlIsCorrect();
    // 👉 Action select by CRA
    await selectOperatorPage.selectByCraNumber(E2EValue.SEARCH_CRA);
    // 🔍 Assert operator confirmation message
    await selectOperatorPage.msgConfirmationIsVisible();
    // 👉 Action accept operator
    await selectOperatorPage.acceptOperator();
    // 🔍 Assert no access message
    await selectOperatorPage.msgNoAccessIsVisible();
    // 👉 Action route go back
    await selectOperatorPage.routeBack();
    // 🔍 Assert operator confirmation message
    await selectOperatorPage.msgConfirmationIsVisible();
    // 👉 Action route return
    await selectOperatorPage.routeReturn();
    // 🔍 Assert operator confirmation message
    await selectOperatorPage.msgSelectOpertorIsVisible();
  });
});

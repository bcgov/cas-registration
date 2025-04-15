// 🧪 Suite to test the administration industry_user workflow
import { test } from "@playwright/test";
// 🪄 Page Object Models
import { OperatorPOM } from "@/administration-e2e/poms/operator";
// ☰ Enums
import { OperatorE2EValue } from "@/administration-e2e/utils/enums";
import { AppRoute } from "@/administration-e2e/utils/enums";
import { AppName } from "@/administration-e2e/utils/constants";
import { UserRole } from "@bciers/e2e/utils/enums";
import { expect } from "@playwright/test";
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
});

test.beforeEach(async ({ context }) => {
  await setupTestEnvironment(AppName + "-" + UserRole.INDUSTRY_USER);
  await happoPlaywright.init(context);
});

test.afterEach(async () => {
  await happoPlaywright.finish();
});

// 🏷 Annotate test suite as serial so to use 1 worker- prevents failure in setupTestEnvironment
test.describe.configure({ mode: "serial" });
test.describe("Test select operator paths", () => {
  // 👤 run test using the storageState for this role
  const storageState = JSON.parse(
    process.env.E2E_INDUSTRY_USER_STORAGE_STATE as string,
  );
  test.use({ storageState: storageState });
  test("Select by legal name existing operator with existing admin", async ({
    page,
  }) => {
    // setup pageContent for happo
    let pageContent = page.locator("html");
    // 🛸 Navigates to select operator
    const selectOperatorPage = new OperatorPOM(page);
    await selectOperatorPage.route(AppRoute.OPERATOR_SELECT);
    await selectOperatorPage.urlIsCorrect(AppRoute.OPERATOR_SELECT);

    // 👉 Action search by legal name
    await selectOperatorPage.selectByLegalName(
      OperatorE2EValue.SEARCH_LEGAL_NAME,
      "Bravo Technologies - has parTNER operator",
    );

    await happoPlaywright.screenshot(page, pageContent, {
      component: "Select operator form",
      variant: "default",
    });
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);

    // 👉 Action accept operator
    await selectOperatorPage.acceptOperator();
    // 👉 Action request administrator access
    await selectOperatorPage.requestAccess();

    // 🔍 Assert access requested message
    await selectOperatorPage.msgRequestAccessConfirmedIsVisible();
    // 📷 Cheese!

    await happoPlaywright.screenshot(page, pageContent, {
      component: "Select operator access request confirmation",
      variant: "default",
    });
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);
  });
  test("Select by CRA number existing operator with no admin", async ({
    page,
  }) => {
    // setup pageContent for happo
    let pageContent = page.locator("html");
    // 🛸 Navigates to select operator
    const selectOperatorPage = new OperatorPOM(page);
    await selectOperatorPage.route(AppRoute.OPERATOR_SELECT);
    await selectOperatorPage.urlIsCorrect(AppRoute.OPERATOR_SELECT);

    // 👉 Action search by CRA number (Delta Innovations)
    await selectOperatorPage.selectByCraNumber("987654323");

    // 👉 Action accept operator
    await selectOperatorPage.acceptOperator();
    // 👉 Action request administrator access
    await selectOperatorPage.requestAccessAdmin();

    // 🔍 Assert access requested message
    await selectOperatorPage.msgRequestAccessAdminConfirmedIsVisible();
    // 📷 Cheese!

    await happoPlaywright.screenshot(page, pageContent, {
      component: "Select operator admin access request confirmation",
      variant: "default",
    });
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);
  });
  test("Add new operator", async ({ page }) => {
    // 🛸 Navigates to add operator
    const selectOperatorPage = new OperatorPOM(page);
    await selectOperatorPage.route(AppRoute.OPERATOR_ADD);
    // 👉 Action fill all operator form fields
    await selectOperatorPage.fillRequiredInformation();
    let pageContent = page.locator("html");
    await happoPlaywright.screenshot(page, pageContent, {
      component: "Add operator form",
      variant: "filled",
    });
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);

    await selectOperatorPage.buttonSave.click();
    await expect(
      selectOperatorPage.page.getByText(
        /All changes have been successfully saved/i,
      ),
    ).toBeVisible();
  });
});

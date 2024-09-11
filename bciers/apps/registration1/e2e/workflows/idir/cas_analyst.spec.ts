// 🧪 Suite to test the cas_analyst workflows using storageState
import { test } from "@playwright/test";
// 🪄 Page Object Models
import { DashboardPOM } from "@/e2e/poms/dashboard";
import { OperationsPOM } from "@/e2e/poms/operations";
import { OperatorsPOM } from "@/e2e/poms/operators";
// 🛠️ Helpers
import {
  setupTestEnvironment,
  stabilizeAccordion,
  takeStabilizedScreenshot,
} from "@/e2e/utils/helpers";
// ☰ Enums
import {
  OperationStatus,
  TableDataField,
  UserOperatorStatus,
  UserRole,
} from "@/e2e/utils/enums";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });
// 📷 happo visual testing
const happoPlaywright = require("happo-playwright");

test.beforeAll(async () => {
  // Hit the test setup endpoint before running the tests to ensure the test data is set up
  await setupTestEnvironment(UserRole.CAS_ANALYST);
});

test.beforeEach(async ({ context }) => {
  // initialize Happo
  await happoPlaywright.init(context);
});

test.afterEach(async () => {
  await happoPlaywright.finish();
});

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });
test.describe("Test Workflow cas_analyst", () => {
  // 👤 run test using the storageState for this role
  const storageState = JSON.parse(
    process.env.E2E_CAS_ANALYST_STORAGE_STATE as string,
  );
  // Note: specify storageState for each test file
  test.use({ storageState: storageState });
  test.describe("Test Operators workflow", () => {
    test("Test grid view", async ({ page }) => {
      const dashboardPage = new DashboardPOM(page);
      const operatorsPage = new OperatorsPOM(page);
      // 🛸 Navigate to dashboard page
      await dashboardPage.route();
      // 🛸 Navigates to operators tile page
      await dashboardPage.clickOperatorsTile();
      // 🔍 Assert that the current URL is operators
      await operatorsPage.urlIsCorrect();
      // 🔍 Assert `Operators` view, table and data reflect role `cas_analyst`
      await operatorsPage.viewIsCorrect(UserRole.CAS_ANALYST);
      await operatorsPage.tableIsVisible();
      await operatorsPage.tableHasExpectedColumns(UserRole.CAS_ANALYST);
      await operatorsPage.tableHasExpectedColumnValues(
        UserRole.CAS_ANALYST,
        TableDataField.STATUS,
      );
      // 📷 Cheese!
      // Disabled due to flakiness - tech debt to resolve:
      // https://github.com/bcgov/cas-registration/issues/2181
      // await stabilizeGrid(page, 20);
      // const pageContent = page.locator("html");
      // await happoPlaywright.screenshot(operatorsPage.page, pageContent, {
      //   component: "Operators Grid cas_analyst",
      //   variant: "default",
      // });
    });

    test("Test details view by status", async ({ page }) => {
      const operatorsPage = new OperatorsPOM(page);
      // 🛸 Navigate to operators page
      operatorsPage.route();
      // 🔍 Assert cas_analyst is able to click "View Details" on see detailed info related Declined
      await operatorsPage.formHasExpectedUX(UserOperatorStatus.DECLINED);
      // 📷 Cheese!
      await stabilizeAccordion(page, 2);
      await takeStabilizedScreenshot(happoPlaywright, operatorsPage.page, {
        component: "Operators Details Page cas_analyst",
        variant: "declined",
      });
      // 🛸 Navigate back
      await operatorsPage.navigateBack();
      // 🔍 Assert table is visible
      await operatorsPage.tableIsVisible();

      // 🔍 Assert cas_analyst is able to click "View Details" on see detailed info related Approved
      await operatorsPage.formHasExpectedUX(UserOperatorStatus.APPROVED);
      // 📷 Cheese!
      await stabilizeAccordion(page, 2);
      await takeStabilizedScreenshot(happoPlaywright, operatorsPage.page, {
        component: "Operators Details Page cas_analyst",
        variant: "approved",
      });
      // 🛸 Navigate back
      await operatorsPage.navigateBack();
      // 🔍 Assert table is visible
      await operatorsPage.tableIsVisible();

      // 🔍 Assert cas_analyst is able to click "View Details" on see detailed info related Pending
      await operatorsPage.formHasExpectedUX(
        UserOperatorStatus.PENDING,
        "New Operator 3 Legal Name",
      );
      // 📷 Cheese!
      await stabilizeAccordion(page, 2);
      await takeStabilizedScreenshot(happoPlaywright, operatorsPage.page, {
        component: "Operators Details Page cas_analyst",
        variant: "pending",
      });
      // 🛸 Navigate back
      await operatorsPage.navigateBack();
      // 🔍 Assert table is visible
      await operatorsPage.tableIsVisible();
    });

    test("Test details form by workflow", async ({ page }) => {
      const operatorsPage = new OperatorsPOM(page);
      // 🛸 Navigate to operators page
      operatorsPage.route();
      // 🔍 Assert cas_analyst workflow New Operator, Pending: Reject
      await operatorsPage.formHasExpectedWorkflow(UserRole.CAS_ANALYST, 1);
      // 🔍 Assert cas_analyst workflow New Operator, Pending: Reject
      await operatorsPage.formHasExpectedWorkflow(UserRole.CAS_ANALYST, 2);
      // 🔍 Assert cas_analyst workflow Existing Operator, Pending: Approve
      await operatorsPage.formHasExpectedWorkflow(UserRole.CAS_ANALYST, 3);
      // 🔍 Assert cas_analyst workflow Existing Operator,  Pending: Reject
      await operatorsPage.formHasExpectedWorkflow(UserRole.CAS_ANALYST, 4);
    });
  });

  test.describe("Test Operations workflow", () => {
    test("Test grid view", async ({ page }) => {
      const dashboardPage = new DashboardPOM(page);
      const operationsPage = new OperationsPOM(page);
      // 🛸 Navigate to dashboard page
      await dashboardPage.route();
      // 🛸 Navigates to operations tile page
      await dashboardPage.clickOperationsTile();
      // 🔍 Assert that the current URL is operations
      await operationsPage.urlIsCorrect();
      // 🔍 Assert `Operations` view, table and data reflect role `cas_analyst`
      await operationsPage.viewIsCorrect(UserRole.CAS_ANALYST);
      await operationsPage.tableIsVisible();
      await operationsPage.tableHasExpectedColumns(UserRole.CAS_ANALYST);
      await operationsPage.tableHasExpectedColumnValues(
        UserRole.CAS_ANALYST,
        TableDataField.STATUS,
      );
      // 📷 Cheese!
      // Disabled due to flakiness - tech debt to resolve:
      // https://github.com/bcgov/cas-registration/issues/2181
      // await stabilizeGrid(page, 20);
      // await takeStabilizedScreenshot(happoPlaywright, operationsPage.page, {
      //   component: "Operations Grid cas_analyst",
      //   variant: "default",
      //   targets: ["chrome", "firefox", "safari"], // this screenshot is flaky in edge
      // });
    });

    test("Test details view by status", async ({ page }) => {
      const operationsPage = new OperationsPOM(page);
      // 🛸 Navigate to operations page
      operationsPage.route();
      // 🔍 Assert cas_analyst is able to click "View Details" on each status and see detailed info related to that status
      await operationsPage.formHasExpectedUX(OperationStatus.PENDING);
      // 📷 Cheese!
      await stabilizeAccordion(page, 4);
      await takeStabilizedScreenshot(happoPlaywright, operationsPage.page, {
        component: "Operations Details Page cas_analyst",
        variant: "pending",
        targets: ["chrome"], // only taking the shot in chrome because the other browsers are too flaky
      });
      // 🛸 Navigate back
      await operationsPage.navigateBack();
      // 🔍 Assert table is visible
      await operationsPage.tableIsVisible();

      await operationsPage.formHasExpectedUX(OperationStatus.DECLINED);
      // 📷 Cheese!
      await stabilizeAccordion(operationsPage.page, 4);
      await takeStabilizedScreenshot(happoPlaywright, operationsPage.page, {
        component: "Operations Details Page cas_analyst",
        variant: "declined",
      });
      // 🛸 Navigate back
      await operationsPage.navigateBack();
      // 🔍 Assert table is visible
      await operationsPage.tableIsVisible();

      /* FIXME FOR CI
      await operationsPage.formHasExpectedUX(OperationStatus.APPROVED);
      // 📷 Cheese!
      pageContent = page.locator("html");
      await happoPlaywright.screenshot(operationsPage.page, pageContent, {
        component: "Operations Details Page cas_analyst",
        variant: "approved",
      });
      // 🛸 Navigate back
      await operationsPage.navigateBack();
      // 🔍 Assert table is visible
      await operationsPage.tableIsVisible();
      */
    });

    test("Test details form by workflow", async ({ page }) => {
      const operationsPage = new OperationsPOM(page);
      // 🛸 Navigate to operations page
      operationsPage.route();
      // 🔍 Assert cas_analyst workflow Pending, Request Changes, Undo (Request Changes), Approve
      await operationsPage.formHasExpectedWorkflow(
        UserRole.CAS_ANALYST,
        OperationStatus.PENDING,
        1,
      );
      // 🔍 Assert cas_analyst workflow Pending, Decline
      await operationsPage.formHasExpectedWorkflow(
        UserRole.CAS_ANALYST,
        OperationStatus.PENDING,
        2,
      );
      // 🔍 Assert cas_analyst workflow Approved, Preview the Statutory Declaration PDF
      await operationsPage.formHasExpectedWorkflow(
        UserRole.CAS_ANALYST,
        OperationStatus.APPROVED,
        3,
      );
    });
  });
});

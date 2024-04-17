// 🧪 Suite to test the cas_admin workflows using storageState
import { test } from "@playwright/test";
// 🪄 Page Object Models
import { DashboardPOM } from "@/e2e/poms/dashboard";
import { OperationsPOM } from "@/e2e/poms/operations";
import { OperatorsPOM } from "@/e2e/poms/operators";
// 🛠️ Helpers
import { setupTestEnvironment } from "@/e2e/utils/helpers";
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
  await setupTestEnvironment(UserRole.CAS_ADMIN);
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
test.describe("Test Workflow cas_admin", () => {
  // 👤 run test using the storageState for this role
  const storageState = JSON.parse(process.env.E2E_CAS_ADMIN_STORAGE as string);
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
      // 🔍 Assert `Operators` view, table and data reflect role `cas_admin`
      await operatorsPage.viewIsCorrect(UserRole.CAS_ADMIN);
      await operatorsPage.tableIsVisible();
      await operatorsPage.tableHasExpectedColumns(UserRole.CAS_ADMIN);
      await operatorsPage.tableHasExpectedColumnValues(
        UserRole.CAS_ADMIN,
        TableDataField.STATUS
      );
      // 📷 Cheese!
      const pageContent = page.locator("html");
      await happoPlaywright.screenshot(operatorsPage.page, pageContent, {
        component: "Operators Grid cas_admin",
        variant: "default",
      });
    });

    test("Test details view by status", async ({ page }) => {
      const operatorsPage = new OperatorsPOM(page);
      // 🛸 Navigate to operators page
      operatorsPage.route();
      // 🔍 Assert cas_admin is able to click "View Details" on see detailed info related Declined
      await operatorsPage.formHasExpectedUX(UserOperatorStatus.DECLINED);
      // 📷 Cheese!
      let pageContent = page.locator("html");
      await happoPlaywright.screenshot(operatorsPage.page, pageContent, {
        component: "Operators Details Page cas_admin",
        variant: "declined",
      });
      // 🔍 Assert cas_admin is able to click "View Details" on see detailed info related Approved
      await operatorsPage.formHasExpectedUX(UserOperatorStatus.APPROVED);
      // 📷 Cheese!
      pageContent = page.locator("html");
      await happoPlaywright.screenshot(operatorsPage.page, pageContent, {
        component: "Operators Details Page cas_admin",
        variant: "approved",
      });
      // 🔍 Assert cas_admin is able to click "View Details" on see detailed info related Pending
      await operatorsPage.formHasExpectedUX(UserOperatorStatus.PENDING);
      // 📷 Cheese!
      pageContent = page.locator("html");
      await happoPlaywright.screenshot(operatorsPage.page, pageContent, {
        component: "Operators Details Page cas_admin",
        variant: "pending",
      });
    });

    test("Test details form by workflow", async ({ page }) => {
      const operatorsPage = new OperatorsPOM(page);
      // 🛸 Navigate to operators page
      operatorsPage.route();
      // 🔍 Assert cas_admin workflow New Operator, Pending: Reject
      await operatorsPage.formHasExpectedWorkflow(UserRole.CAS_ADMIN, 1);
      // 🔍 Assert cas_admin workflow New Operator, Pending: Reject
      await operatorsPage.formHasExpectedWorkflow(UserRole.CAS_ADMIN, 2);
      // 🔍 Assert cas_admin workflow Existing Operator, Pending: Approve
      await operatorsPage.formHasExpectedWorkflow(UserRole.CAS_ADMIN, 3);
      // 🔍 Assert cas_admin workflow Existing Operator,  Pending: Reject
      await operatorsPage.formHasExpectedWorkflow(UserRole.CAS_ADMIN, 4);
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
      // 🔍 Assert `Operations` view, table and data reflect role `cas_admin`
      await operationsPage.viewIsCorrect(UserRole.CAS_ADMIN);
      await operationsPage.tableIsVisible();
      await operationsPage.tableHasExpectedColumns(UserRole.CAS_ADMIN);
      await operationsPage.tableHasExpectedColumnValues(
        UserRole.CAS_ADMIN,
        TableDataField.STATUS
      );
      // 📷 Cheese!
      const pageContent = page.locator("html");
      await happoPlaywright.screenshot(operationsPage.page, pageContent, {
        component: "Operations Grid cas_admin",
        variant: "default",
      });
    });

    test("Test details view by status", async ({ page }) => {
      const operationsPage = new OperationsPOM(page);
      // 🛸 Navigate to operations page
      operationsPage.route();
      // 🔍 Assert cas_admin is able to click "View Details" on each status and see detailed info related to that status
      await operationsPage.formHasExpectedUX(OperationStatus.DECLINED);
      // 📷 Cheese!
      let pageContent = page.locator("html");
      await happoPlaywright.screenshot(operationsPage.page, pageContent, {
        component: "Operations Details Page cas_admin",
        variant: "declined",
      });
      await operationsPage.formHasExpectedUX(OperationStatus.APPROVED);
      // 📷 Cheese!
      pageContent = page.locator("html");
      await happoPlaywright.screenshot(operationsPage.page, pageContent, {
        component: "Operations Details Page cas_admin",
        variant: "approved",
      });
      await operationsPage.formHasExpectedUX(OperationStatus.PENDING);
      // 📷 Cheese!
      pageContent = page.locator("html");
      await happoPlaywright.screenshot(operationsPage.page, pageContent, {
        component: "Operations Details Page cas_admin",
        variant: "pending",
      });
    });

    test("Test details form by workflow", async ({ page }) => {
      const operationsPage = new OperationsPOM(page);
      // 🛸 Navigate to operations page
      operationsPage.route();
      // 🔍 Assert cas_admin workflow Pending, Request Changes, Undo (Request Changes), Approve
      await operationsPage.formHasExpectedWorkflow(
        UserRole.CAS_ADMIN,
        OperationStatus.PENDING,
        1
      );
      // 🔍 Assert cas_admin workflow Pending, Decline
      await operationsPage.formHasExpectedWorkflow(
        UserRole.CAS_ADMIN,
        OperationStatus.PENDING,
        2
      );
      // 🔍 Assert cas_admin workflow Approved, Preview the Statutory Declaration PDF
      await operationsPage.formHasExpectedWorkflow(
        UserRole.CAS_ADMIN,
        OperationStatus.APPROVED,
        3
      );
    });
  });
});

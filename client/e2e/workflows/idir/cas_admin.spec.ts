// 🧪 Suite to test the cas_admin workflows using storageState
import { test } from "@playwright/test";
// 🪄 Page Object Models
import { DashboardPOM } from "@/e2e/poms/dashboard";
import { OperationsPOM } from "@/e2e/poms/operations";
import { OperatorsPOM } from "@/e2e/poms/operators";
// 🛠️ Helpers
import {
  filterTableByFieldId,
  sortTableByColumnLabel,
  setupTestEnvironment,
  tableRowCount,
} from "@/e2e/utils/helpers";
// ☰ Enums
import {
  OperationStatus,
  OperationTableDataField,
  OperationTableHeaders,
  TableDataField,
  UserOperatorStatus,
  UserRole,
} from "@/e2e/utils/enums";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });

// Hit the test setup endpoint before running the tests to ensure the test data is set up
test.beforeAll(async () => {
  await setupTestEnvironment(UserRole.CAS_ADMIN);
});

test.afterAll(async () => {
  await setupTestEnvironment(undefined, true); // clean up test data after all tests are done
});

test.describe("Test Workflow cas_admin", () => {
  // 👤 run test using the storageState for this role
  const storageState = JSON.parse(process.env.E2E_CAS_ADMIN_STORAGE as string);
  // Note: specify storageState for each test file or test group, instead of setting it in the config. https://playwright.dev/docs/next/auth#reuse-signed-in-state
  test.use({ storageState: storageState }); // this will error if no such file or directory

  test("Operators Tile workflow", async ({ page }) => {
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
      TableDataField.STATUS,
    );
    // 🧪 Detail Form UX by Status
    // 🔍 Assert cas_admin is able to click "View Details" on see detailed info related Declined
    await operatorsPage.formHasExpectedUX(UserOperatorStatus.DECLINED);
    // 🔍 Assert cas_admin is able to click "View Details" on see detailed info related Approved
    await operatorsPage.formHasExpectedUX(UserOperatorStatus.APPROVED);
    // 🔍 Assert cas_admin is able to click "View Details" on see detailed info related Pending
    await operatorsPage.formHasExpectedUX(UserOperatorStatus.PENDING);
    // 🧪 Detail Form Workflows
    // 🔍 Assert cas_admin workflow New Operator, Pending: Reject
    await operatorsPage.formHasExpectedWorkflow(UserRole.CAS_ADMIN, 1);
    // 🔍 Assert cas_admin workflow New Operator, Pending: Reject
    await operatorsPage.formHasExpectedWorkflow(UserRole.CAS_ADMIN, 2);
    // 🔍 Assert cas_admin workflow Existing Operator, Pending: Approve
    await operatorsPage.formHasExpectedWorkflow(UserRole.CAS_ADMIN, 3);
    // 🔍 Assert cas_admin workflow Existing Operator,  Pending: Reject
    await operatorsPage.formHasExpectedWorkflow(UserRole.CAS_ADMIN, 4);
  });

  test("Operations Tile workflow", async ({ page }) => {
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
      TableDataField.STATUS,
    );
    // 🔍 Assert cas_admin is able to click "View Details" on each status and see detailed info related to that status
    await operationsPage.formHasExpectedUX(OperationStatus.DECLINED);
    await operationsPage.formHasExpectedUX(OperationStatus.APPROVED);
    await operationsPage.formHasExpectedUX(OperationStatus.PENDING);
    // 🔍 Assert cas_admin workflow Pending, Request Changes, Undo (Request Changes), Approve
    await operationsPage.formHasExpectedWorkflow(
      UserRole.CAS_ADMIN,
      OperationStatus.PENDING,
      1,
    );
    // 🔍 Assert cas_admin workflow Pending, Decline
    await operationsPage.formHasExpectedWorkflow(
      UserRole.CAS_ADMIN,
      OperationStatus.PENDING,
      2,
    );
    // 🔍 Assert cas_admin workflow Approved, Preview the Statutory Declaration PDF
    await operationsPage.formHasExpectedWorkflow(
      UserRole.CAS_ADMIN,
      OperationStatus.APPROVED,
      3,
    );
  });

  test("Operations table sorting and filtering", async ({ page }) => {
    // We do a more thorough test of the operations table in the industry_user_admin.spec.ts file
    // This test is just to make sure that the sorting and filtering works for the cas_admin role
    // which also has the extra Operator column
    const operationsPage = new OperationsPOM(page);
    // 🛸 Navigate to operations table page
    await operationsPage.route();
    // 🔍 Assert that the current URL is operations
    await operationsPage.urlIsCorrect();
    // 🔍 Assert `Operations` view, table reflect role `industry_user_admin`
    await operationsPage.tableIsVisible();
    await operationsPage.tableHasExpectedColumns(UserRole.CAS_ADMIN);

    await filterTableByFieldId(
      operationsPage.page,
      OperationTableDataField.OPERATOR,
      OperationTableHeaders.OPERATOR,
      "Existing",
    );
    await tableRowCount(operationsPage.page, 12);

    await sortTableByColumnLabel(
      operationsPage.page,
      OperationTableHeaders.OPERATOR,
      "Existing Operator 2 Legal Name",
    );

    await sortTableByColumnLabel(
      operationsPage.page,
      OperationTableHeaders.SUBMISSION_DATE,
      "Dec 16, 2023\n7:27:00 a.m. PST",
    );

    await filterTableByFieldId(
      operationsPage.page,
      OperationTableDataField.OPERATION,
      OperationTableHeaders.OPERATION,
      "Operation 3",
    );

    await tableRowCount(operationsPage.page, 1);

    // Check junk search
    await filterTableByFieldId(
      operationsPage.page,
      OperationTableDataField.OPERATION,
      OperationTableHeaders.OPERATION,
      "this search will return no results",
      true,
    );
  });
});

// 🧪 Suite to test the cas_analyst workflows using storageState
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

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });

// Hit the test setup endpoint before running the tests to ensure the test data is set up
test.beforeAll(async () => {
  await setupTestEnvironment(UserRole.CAS_ANALYST);
});

test.afterAll(async () => {
  await setupTestEnvironment(undefined, true); // clean up test data after all tests are done
});

test.describe("Test Workflow cas_analyst", () => {
  // 👤 run test using the storageState for this role
  const storageState = JSON.parse(
    process.env.E2E_CAS_ANALYST_STORAGE as string
  );
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
    // 🔍 Assert `Operators` view, table and data reflect role `cas_analyst`
    await operatorsPage.viewIsCorrect(UserRole.CAS_ANALYST);
    await operatorsPage.tableIsVisible();
    await operatorsPage.tableHasExpectedColumns(UserRole.CAS_ANALYST);
    await operatorsPage.tableHasExpectedColumnValues(
      UserRole.CAS_ANALYST,
      TableDataField.STATUS
    );
    // 🧪 Detail Form UX by Status
    // 🔍 Assert cas_analyst is able to click "View Details" on see detailed info related Declined
    await operatorsPage.formHasExpectedUX(UserOperatorStatus.DECLINED);
    // 🔍 Assert cas_analyst is able to click "View Details" on see detailed info related Approved
    await operatorsPage.formHasExpectedUX(UserOperatorStatus.APPROVED);
    // 🔍 Assert cas_analyst is able to click "View Details" on see detailed info related Pending
    await operatorsPage.formHasExpectedUX(UserOperatorStatus.PENDING);
    // 🧪 Detail Form Workflows
    // 🔍 Assert cas_analyst workflow New Operator, Pending: Approve
    await operatorsPage.formHasExpectedWorkflow(UserRole.CAS_ANALYST, 1);
    // 🔍 Assert cas_analyst workflow New Operator, Pending: Reject
    await operatorsPage.formHasExpectedWorkflow(UserRole.CAS_ANALYST, 2);
    // 🔍 Assert cas_analyst workflow Existing Operator, Pending: Approve
    await operatorsPage.formHasExpectedWorkflow(UserRole.CAS_ANALYST, 3);
    // 🔍 Assert cas_analyst workflow Existing Operator,  Pending: Reject
    await operatorsPage.formHasExpectedWorkflow(UserRole.CAS_ANALYST, 4);
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
    // 🔍 Assert `Operations` view, table and data reflect role `cas_analyst`
    await operationsPage.viewIsCorrect(UserRole.CAS_ANALYST);
    await operationsPage.tableIsVisible();
    await operationsPage.tableHasExpectedColumns(UserRole.CAS_ANALYST);
    await operationsPage.tableHasExpectedColumnValues(
      UserRole.CAS_ANALYST,
      TableDataField.STATUS
    );
    // 🔍 Assert cas_analyst is able to click "View Details" on each status and see detailed info related to that status
    await operationsPage.formHasExpectedUX(OperationStatus.DECLINED);
    await operationsPage.formHasExpectedUX(OperationStatus.APPROVED);
    await operationsPage.formHasExpectedUX(OperationStatus.PENDING);
    // 🔍 Assert cas_analyst workflow Pending, Request Changes, Undo (Request Changes), Approve
    await operationsPage.formHasExpectedWorkflow(
      UserRole.CAS_ANALYST,
      OperationStatus.PENDING,
      1
    );
    // 🔍 Assert cas_analyst workflow Pending, Decline
    await operationsPage.formHasExpectedWorkflow(
      UserRole.CAS_ANALYST,
      OperationStatus.PENDING,
      2
    );
    // 🔍 Assert cas_analyst workflow Approved, Preview the Statutory Declaration PDF
    await operationsPage.formHasExpectedWorkflow(
      UserRole.CAS_ANALYST,
      OperationStatus.APPROVED,
      3
    );
  });
});

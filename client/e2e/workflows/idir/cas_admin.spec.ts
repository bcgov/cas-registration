// 🧪 Suite to test the cas_admin workflows using storageState
import { test, expect } from "@playwright/test";
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
    // Click the `Operators` tile
    await dashboardPage.clickOperatorsTile();
    // 🛸 Navigates to operators tile page
    await operatorsPage.urlIsCorrect();
    // 🧪 `Operators` view, table and data reflect role `cas_admin`
    await operatorsPage.viewIsCorrect(UserRole.CAS_ADMIN);
    await operatorsPage.tableIsVisible();
    await operatorsPage.tableHasExpectedColumns();
    await operatorsPage.tableHasExpectedColumnValues(
      UserRole.CAS_ADMIN,
      TableDataField.STATUS
    );
    // 🧪 cas_admin is able to click "View Details" on each status and see detailed info related to that status
    await operatorsPage.detailsHasExpectedUX(UserOperatorStatus.DECLINED);
    await operatorsPage.detailsHasExpectedUX(UserOperatorStatus.APPROVED);
    await operatorsPage.detailsHasExpectedUX(UserOperatorStatus.PENDING);
    // 🧪 cas_admin workflow Pending, New Operator, Approve
    await operatorsPage.detailsHasExpectedWorkflow(UserRole.CAS_ADMIN, 2);
    // 🧪 cas_admin workflow Pending, New Operator, Reject
    await operatorsPage.detailsHasExpectedWorkflow(UserRole.CAS_ADMIN, 3);
    // 🧪 cas_admin workflow Pending, Existing Operator, Approve workflow
    await operatorsPage.detailsHasExpectedWorkflow(UserRole.CAS_ADMIN, 5);
    // 🧪 cas_admin workflow Pending, Existing Operator, Reject workflow
    await operatorsPage.detailsHasExpectedWorkflow(UserRole.CAS_ADMIN, 15);
  });
  test("Operations Tile workflow", async ({ page }) => {
    const dashboardPage = new DashboardPOM(page);
    const operationsPage = new OperationsPOM(page);
    // 🛸 Navigate to dashboard page
    await dashboardPage.route();
    await dashboardPage.clickOperationsTile();
    // 🛸 Navigates to operations tile page
    await operationsPage.urlIsCorrect();
    // 🧪 `Operations` view, table and data reflect role `cas_admin`
    await operationsPage.viewIsCorrect(UserRole.CAS_ADMIN);
    await operationsPage.tableIsVisible();
    await operationsPage.tableHasExpectedColumns();
    await operationsPage.tableHasExpectedColumnValues(
      UserRole.CAS_ADMIN,
      TableDataField.STATUS
    );
    // 🧪 cas_admin is able to click "View Details" on each status and see detailed info related to that status
    await operationsPage.detailsHasExpectedUX(OperationStatus.DECLINED);
    await operationsPage.detailsHasExpectedUX(OperationStatus.APPROVED);
    await operationsPage.detailsHasExpectedUX(OperationStatus.PENDING);
    // 🧪 cas_admin workflow Pending, Request Changes, Undo (Request Changes), Approve
    await operationsPage.detailsHasExpectedWorkflow(
      UserRole.CAS_ADMIN,
      OperationStatus.PENDING,
      1
    );
    // 🧪 cas_admin workflow Pending, Decline
    await operationsPage.detailsHasExpectedWorkflow(
      UserRole.CAS_ADMIN,
      OperationStatus.PENDING,
      2
    );
    // 🧪 cas_admin workflow Approved, Preview the Statutory Declaration PDF
    await operationsPage.detailsHasExpectedWorkflow(
      UserRole.CAS_ADMIN,
      OperationStatus.APPROVED,
      3
    );
  });
});

// 🧪 Suite to test the cas_admin workflows using storageState
// 🔍 Asserts new user is redirected to profile

import { test } from "@playwright/test";
// 🪄 Page Object Models
import { DashboardPOM } from "@/e2e/poms/dashboard";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
import { OperationsPOM } from "@/e2e/poms/operations";
dotenv.config({ path: "./e2e/.env.local" });

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });
test.describe("Test Workflow cas_admin", () => {
  // 👤 run test using the storageState for this role
  const storageState = JSON.parse(process.env.E2E_CAS_ADMIN_STORAGE as string);
  // Note: specify storageState for each test file or test group, instead of setting it in the config. https://playwright.dev/docs/next/auth#reuse-signed-in-state
  test.use({ storageState: storageState }); // this will error if no such file or directory
  test("Test Redirect to Dashboard", async ({ page }) => {
    // 🛸 Navigate to dashboard page
    const dashboardPage = new DashboardPOM(page);
    await dashboardPage.route();
    // 🔍 Assert that the current URL ends with "(authenticated)/dashboard"
    await dashboardPage.urlIsCorrect();
  });

  test("Operations Tile workflow", async ({ page }) => {
    // 🛸 Navigate to operations tile page
    const dashboardPage = new DashboardPOM(page);
    const operationsPage = new OperationsPOM(page);
    await dashboardPage.route();
    await dashboardPage.clickOperationsTile();
    await operationsPage.urlIsCorrect();
    await operationsPage.page.waitForSelector(".MuiDataGrid-root");

    // AC: table headers include ["Operator", "Operation" (legal name), "Submission Date", "Actions", "Status", and "BORO ID"]
    await operationsPage.columnNamesAreCorrect([
      "BC GHG ID",
      "Operator",
      "Operation",
      "Submission Date",
      "BORO ID",
      "Application Status",
      "Action",
    ]);
    // AC: is able to view all operations with statuses of "Pending", "Accepted", or "Declined"
    // brianna--do we already have the dev data in from the other CI steps and django setup?
    await operationsPage.operationsViewIsCorrect("cas_admin", [
      "Approved",
      "Approved",
      "Declined",
      "Pending",
      "Pending",
      "Pending",
      "Pending",
      "Pending",
      "Pending",
      "Pending",
      "Pending",
      "Pending",
      "Pending",
      "Pending",
      "Pending",
      "Pending",
      "Pending",
      "Pending",
      "Pending",
      "Pending",
    ]);

    // AC: is able to click "View Details" on any operation and see detailed info about it (read only)
    await operationsPage.page
      .getByText(/view details/i)
      .first()
      .click();

    //  AC: is not able to edit the data in any Operation form
    // Brianna will we need to expand the sections to check individually, or will this cover it?
    await operationsPage.checkReadonlyFields();
  });

  //   AC: is able to Preview the Statutory Declaration PDF in any Operation form
  //  AC: is able to Approve, Decline, or Request Changes on any Pending operation
  // - AC: approving an Operation triggers the generation of a BORO ID, which appears at the top of the form
});

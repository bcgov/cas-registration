// 🧪 Suite to test the cas_admin workflows using storageState
// 🔍 Asserts new user is redirected to profile

import { test, expect } from "@playwright/test";
// 🪄 Page Object Models
import { DashboardPOM } from "@/e2e/poms/dashboard";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
import { OperationsPOM } from "@/e2e/poms/operations";
import { getAllFormInputs, downloadPDF } from "@/e2e/utils/helpers";
import { DataTestID } from "@/e2e/utils/enums";
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
    await operationsPage.operationsTableIsVisible();

    // 🧪 cas_admin is able to view operations table with the following columns
    await operationsPage.columnNamesAreCorrect([
      "BC GHG ID",
      "Operator",
      "Operation",
      "Submission Date",
      "BORO ID",
      "Application Status",
      "Action",
    ]);
    // 🧪 cas_admin is able to view all operations with statuses of "Pending", "Accepted", or "Declined"
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

    // 🧪 cas_admin is able to click "View Details" on any operation and see detailed info about it (read only)
    await operationsPage.clickViewDetailsButton(); // APPROVED operation

    // Approved operation message on top of the form
    await expect(
      operationsPage.page.locator(
        DataTestID.CAS_ADMIN_OPERATION_APPROVED_MESSAGE,
      ),
    ).toBeVisible();

    await operationsPage.clickExpandAllButton();
    await operationsPage.checkFormHeaders();

    // Check that all form fields are disabled and not editable
    const allFormFields = await getAllFormInputs(operationsPage.page);
    for (const field of allFormFields) {
      await expect(field).toBeDisabled();
      await expect(field).not.toBeEditable();
    }

    //🧪 cas_admin is able to Preview the Statutory Declaration PDF in any Operation form
    await downloadPDF(operationsPage.page, "Preview", "mock_file.pdf");

    await operationsPage.clickCollapseAllButton();

    // 🔙 Navigate back to the operations table
    await operationsPage.clickOperationsLink();

    // 🧪 cas_admin is able to see "Approve", "Decline", or "Request Changes" on a Pending operation
    await operationsPage.clickViewDetailsButton(3); // PENDING operation

    // Get and check the buttons are visible
    const requestChangesButton = await operationsPage.getRequestChangesButton();
    const approveButton = await operationsPage.getApproveButton();
    const rejectButton = await operationsPage.getRejectButton();

    // 🧪 cas_admin is able to click "Request Changes" and subsequently reverse this action on a Pending operation
    await requestChangesButton.click();
    const confirmChangeRequestButton =
      await operationsPage.getConfirmChangeRequestButton();
    await expect(confirmChangeRequestButton).toBeVisible();
    const cancelChangeRequestButton =
      await operationsPage.getCancelChangeRequestButton();
    await expect(cancelChangeRequestButton).toBeVisible();
    await confirmChangeRequestButton.click();
    const undoChangeRequestButton =
      await operationsPage.getUndoChangeRequestButton();
    await expect(undoChangeRequestButton).toBeVisible();
    await undoChangeRequestButton.click();

    // 🧪 cas_admin is able to click "Approve" on a Pending operation and triggers the generation of a BORO ID
    await approveButton.click();
    const modal = await operationsPage.getModal();
    await expect(modal).toBeVisible();
    // Modal has a confirm and cancel button
    const modalConfirmButton =
      await operationsPage.getModalConfirmButton(modal);
    const modalCancelButton = await operationsPage.getModalCancelButton(modal);
    await expect(modalConfirmButton).toBeVisible();
    await expect(modalCancelButton).toBeVisible();
    await modalConfirmButton.click();
    await expect(modal).not.toBeVisible();
    await expect(operationsPage.page.locator(".MuiAlert-message")).toHaveText(
      "You have approved the request for carbon tax exemption.",
    );
    await expect(
      operationsPage.page.locator(
        DataTestID.CAS_ADMIN_OPERATION_APPROVED_MESSAGE,
      ),
    ).toBeVisible();

    // 🔙 Navigate back to the operations table
    operationsPage.clickOperationsLink();

    // 🧪 cas_admin is able to click "Decline" on a Pending operation
    await operationsPage.clickViewDetailsButton(3); // PENDING operation
    await rejectButton.click();
    await expect(modal).toBeVisible();
    await expect(modalConfirmButton).toBeVisible();
    await expect(modalCancelButton).toBeVisible();
    await modalConfirmButton.click();
    await expect(modal).not.toBeVisible();
    await expect(
      operationsPage.page.locator(
        DataTestID.CAS_ADMIN_OPERATION_DECLINED_MESSAGE,
      ),
    ).toBeVisible();
  });
  // TODO: ADD SNAPSHOTS?!?!?

  test("Report a Problem Tile workflow", async ({ page }) => {
    // 🛸 Navigate to dashboard page
    const dashboardPage = new DashboardPOM(page);
    await dashboardPage.route();
    // 🧪 Assert that the current URL ends with "(authenticated)/dashboard"
    await dashboardPage.urlIsCorrect();
    // 🧪 has a mailto: link on it
    expect(dashboardPage.reportProblemLink).toHaveAttribute(
      "href",
      /mailto:GHGRegulator@gov.bc.ca/i,
    );
  });
});

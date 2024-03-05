// 🧪 Suite to test the cas_admin workflows using storageState
// 🔍 Asserts new user is redirected to profile

import { test, expect } from "@playwright/test";
// 🪄 Page Object Models
import { DashboardPOM } from "@/e2e/poms/dashboard";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
import { OperationsPOM } from "@/e2e/poms/operations";
import { getAllFormInputs } from "@/e2e/utils/helpers";
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
    const viewDetailsButtons = operationsPage.page.getByRole("link", {
      name: /view details/i,
    });
    await viewDetailsButtons.first().click(); // APPROVED operation

    // Approved operation message on top of the form
    await expect(
      operationsPage.page.locator(
        "data-testid=cas-admin-operation-approved-message",
      ),
    ).toBeVisible();
    // Click Expand All button
    await operationsPage.page
      .getByRole("button", { name: "Expand All" })
      .click();
    // Check Form Headers
    await expect(
      operationsPage.page.getByRole("button", { name: "Operator Information" }),
    ).toBeVisible();
    await expect(
      operationsPage.page.getByRole("button", {
        name: "Operation Information",
      }),
    ).toBeVisible();
    await expect(
      operationsPage.page.getByRole("button", { name: "Point of Contact" }),
    ).toBeVisible();
    await expect(
      operationsPage.page.getByRole("button", {
        name: "Statutory Declaration and Disclaimer",
      }),
    ).toBeVisible();

    // Check that all form fields are disabled and not editable
    const allFormFields = await getAllFormInputs(operationsPage.page);
    for (const field of allFormFields) {
      await expect(field).toBeDisabled();
      await expect(field).not.toBeEditable();
    }

    //🧪 cas_admin is able to Preview the Statutory Declaration PDF in any Operation form
    const downloadPromise = page.waitForEvent("download"); // Start waiting for download before clicking.
    await operationsPage.page.getByRole("link", { name: "Preview" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain("mock_file.pdf");
    await download.delete(); // Delete the downloaded file (cleanup)

    // Click the Collapse All button
    await operationsPage.page
      .getByRole("button", { name: "Collapse All" })
      .click();
    for (const field of allFormFields) await expect(field).not.toBeVisible();

    // 🔙 Navigate back to the operations table
    await operationsPage.page.getByRole("link", { name: "Operations" }).click();
    await operationsPage.page.waitForSelector(".MuiDataGrid-root");

    // 🧪 cas_admin is able to see "Approve", "Decline", or "Request Changes" on a Pending operation
    await viewDetailsButtons.nth(3).click(); // PENDING operation
    const requestChangesButton = operationsPage.page.locator(
      "button[aria-label='Request Changes']",
    );
    const approveButton = operationsPage.page.locator(
      "button[aria-label='Approve application']",
    );
    const rejectButton = operationsPage.page.locator(
      "button[aria-label='Reject application']",
    );
    await expect(requestChangesButton).toBeVisible();
    await expect(approveButton).toBeVisible();
    await expect(rejectButton).toBeVisible();

    // 🧪 cas_admin is able to click "Request Changes" and subsequently reverse this action on a Pending operation
    await requestChangesButton.click();
    const confirmChangeRequestButton = operationsPage.page.locator(
      "button[aria-label='Confirm Change Request']",
    );
    await expect(confirmChangeRequestButton).toBeVisible();
    const cancelRequestButton = operationsPage.page.locator(
      "button[aria-label='Cancel Change Request']",
    );
    await expect(cancelRequestButton).toBeVisible();
    await confirmChangeRequestButton.click();
    const undoRequestChanges = operationsPage.page.locator(
      "button[aria-label='Undo Request Changes']",
    );
    await expect(undoRequestChanges).toBeVisible();
    await undoRequestChanges.click();

    // 🧪 cas_admin is able to click "Approve" on a Pending operation and triggers the generation of a BORO ID
    await approveButton.click();
    const modal = operationsPage.page.locator("data-testid=modal");
    await expect(modal).toBeVisible();
    await expect(modal.locator("button[aria-label='Confirm']")).toBeVisible();
    await expect(modal.locator("button[aria-label='Cancel']")).toBeVisible();
    await modal.locator("button[aria-label='Confirm']").click();
    await expect(modal).not.toBeVisible();
    await expect(operationsPage.page.locator(".MuiAlert-message")).toHaveText(
      "You have approved the request for carbon tax exemption.",
    );
    await expect(
      operationsPage.page.locator(
        "data-testid=cas-admin-operation-approved-message",
      ),
    ).toBeVisible();

    // 🔙 Navigate back to the operations table
    await operationsPage.page.getByRole("link", { name: "Operations" }).click();
    await operationsPage.page.waitForSelector(".MuiDataGrid-root");

    // 🧪 cas_admin is able to click "Decline" on a Pending operation
    await viewDetailsButtons.nth(3).click(); // PENDING operation
    await rejectButton.click();
    await expect(modal).toBeVisible();
    await expect(modal.locator("button[aria-label='Confirm']")).toBeVisible();
    await expect(modal.locator("button[aria-label='Cancel']")).toBeVisible();
    await modal.locator("button[aria-label='Confirm']").click();
    await expect(modal).not.toBeVisible();
    await expect(
      operationsPage.page.locator(
        "data-testid=cas-admin-operation-declined-message",
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

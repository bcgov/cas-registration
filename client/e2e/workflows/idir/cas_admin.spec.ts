// 🧪 Suite to test the cas_admin workflows using storageState
import { test, expect } from "@playwright/test";
// 🪄 Page Object Models
import { DashboardPOM } from "@/e2e/poms/dashboard";
import { OperationsPOM } from "@/e2e/poms/operations";
// import { OperatorsPOM } from "@/e2e/poms/operators";
// ☰ Enums
import { UserRole } from "@/e2e/utils/enums";
// 🛠️ Helpers
import {
  // getAllFormInputs,
  // downloadPDF,
  tableColumnNamesAreCorrect,
  clickViewDetailsButton,
  // checkFormHeaders,
  // disabledAndNotEditable,
  // getModal,
  // getApproveButton,
  // getRejectButton,
  // checkLocatorsVisibility,
  // getModalConfirmButton,
  // getModalCancelButton,
  // checkAlertMessage,
  // checkFormHeaderIsCollapsed,
  setupTestEnvironment,
} from "@/e2e/utils/helpers";
// ℹ️ Environment variables
import * as dotenv from "dotenv";

// ⚙️ SQL Queries
import { upsertUserRecord } from "@/e2e/utils/queries";

dotenv.config({ path: "./e2e/.env.local" });

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });

// Hit the test setup endpoint before running the tests to ensure the test data is set up
test.beforeAll(async () => {
  await setupTestEnvironment("cas_admin");
  await upsertUserRecord(UserRole.CAS_ADMIN); // upsert cas_admin user in case it was deleted by another test
});

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

  // test("Operators Tile workflow", async ({ page }) => {
  //   // 🛸 Navigate to operators tile page
  //   const dashboardPage = new DashboardPOM(page);
  //   const operatorsPage = new OperatorsPOM(page);
  //   await dashboardPage.route();
  //   await dashboardPage.clickOperatorsTile();
  //   await operatorsPage.urlIsCorrect();
  //   await operatorsPage.operatorsTableIsVisible();

  //   // 🧪 cas_admin is able to view operators table with the following columns
  //   await tableColumnNamesAreCorrect(operatorsPage.page, [
  //     "Request ID",
  //     "First Name",
  //     "Last Name",
  //     "Email",
  //     "Operator",
  //     "Status",
  //     "Action",
  //   ]);

  //   // 🧪 cas_admin is able to view all operators with statuses of "Pending", "Approved", or "Declined"
  //   await operatorsPage.operatorsViewIsCorrect("cas_admin", [
  //     "Declined",
  //     "Approved",
  //     "Pending",
  //   ]);

  //   // 🧪 cas_admin is able to click "View Details" on a declined operator and see detailed info about it (read only)
  //   await clickViewDetailsButton(operatorsPage.page); // DECLINED operator

  //   await operatorsPage.clickExpandAllButton();
  //   await checkFormHeaders(operatorsPage.page, [
  //     "Operator Information",
  //     "User Information",
  //   ]);

  //   // Check that all form fields are disabled and not editable
  //   const allFormFields = await getAllFormInputs(operatorsPage.page);
  //   await disabledAndNotEditable(allFormFields);

  //   // Make sure the review buttons are not visible when viewing a declined operator
  //   const approveButton = await getApproveButton(operatorsPage.page);
  //   const rejectButton = await getRejectButton(operatorsPage.page);
  //   await checkLocatorsVisibility(
  //     operatorsPage.page,
  //     [approveButton, rejectButton],
  //     false,
  //   );

  //   // 🔙 Navigate back to the operators table
  //   await operatorsPage.clickOperatorsLink();

  //   // 🧪 cas_admin is able to click "View Details" on an approved operator and see detailed info about it (read only)
  //   await clickViewDetailsButton(operatorsPage.page, 1); // APPROVED operator

  //   await operatorsPage.clickExpandAllButton();
  //   await checkFormHeaders(operatorsPage.page, [
  //     "Operator Information",
  //     "User Information",
  //   ]);

  //   // Check that all form fields are disabled and not editable
  //   const approvedOperatorFormFields = await getAllFormInputs(
  //     operatorsPage.page,
  //   );
  //   await disabledAndNotEditable(approvedOperatorFormFields);

  //   // Make sure the review buttons are not visible when viewing a declined operator
  //   checkLocatorsVisibility(
  //     operatorsPage.page,
  //     [approveButton, rejectButton],
  //     false,
  //   );

  //   // 🔙 Navigate back to the operators table
  //   await operatorsPage.clickOperatorsLink();

  //   // 🧪 cas_admin is able to click "View Details" on a pending operator and see detailed info about it (read only)
  //   await clickViewDetailsButton(operatorsPage.page, 4); // PENDING operator(new operator)

  //   await operatorsPage.clickExpandAllButton();
  //   await checkFormHeaders(operatorsPage.page, [
  //     "Operator Information",
  //     "User Information",
  //   ]);

  //   // Check that all form fields are disabled and not editable
  //   const pendingOperatorFormFields = await getAllFormInputs(
  //     operatorsPage.page,
  //   );
  //   await disabledAndNotEditable(pendingOperatorFormFields);

  //   // New operator note is visible
  //   await operatorsPage.checkNewOperatorNote();

  //   // Get and check the buttons are visible (Multiple Approve and Decline buttons are visible)
  //   await checkLocatorsVisibility(operatorsPage.page, [
  //     ...(await approveButton.all()),
  //     ...(await rejectButton.all()),
  //   ]);
  //   // 🧪 cas_admin is not allowed to approve an admin access request if the Operator is new and hasn't been Approved yet
  //   const modal = await getModal(operatorsPage.page);
  //   const modalConfirmButton = await getModalConfirmButton(modal);
  //   const modalCancelButton = await getModalCancelButton(modal);
  //   await operatorsPage.notAllowedToApproveAdminRequest(
  //     modal,
  //     modalConfirmButton,
  //     modalCancelButton,
  //   );

  //   await checkAlertMessage(
  //     operatorsPage.page,
  //     operatorsPage.newOperatorMustBeApprovedAlert,
  //   );

  //   // 🧪 cas_admin is able to Approve new operator
  //   await approveButton.first().click(); // clicking operator approval
  //   await expect(modal).toBeVisible();
  //   await checkLocatorsVisibility(operatorsPage.page, [
  //     modalConfirmButton,
  //     modalCancelButton,
  //   ]);
  //   await modalConfirmButton.click();
  //   await checkAlertMessage(
  //     operatorsPage.page,
  //     operatorsPage.approvedOperatorAlert,
  //   );

  //   // 🧪 cas_admin is able to Approve admin request
  //   await approveButton.last().click(); // clicking admin access request approval
  //   await expect(modal).toBeVisible();
  //   await checkLocatorsVisibility(operatorsPage.page, [
  //     modalConfirmButton,
  //     modalCancelButton,
  //   ]);
  //   await modalConfirmButton.click();
  //   await checkAlertMessage(
  //     operatorsPage.page,
  //     operatorsPage.approvedPrimeAdminAlert,
  //     1,
  //   );

  //   // 🔙 Navigate back to the operators table
  //   await operatorsPage.clickOperatorsLink();

  //   // 🧪 cas_admin is able to Decline new operator
  //   await clickViewDetailsButton(operatorsPage.page, 6); // PENDING operator(another new operator)

  //   // New operator note is visible
  //   await operatorsPage.checkNewOperatorNote();

  //   // 🧪 cas_admin is not allowed to decline an admin access request if the Operator is new and hasn't been Approved yet
  //   await operatorsPage.notAllowedToDeclineAdminRequest(
  //     modal,
  //     modalConfirmButton,
  //     modalCancelButton,
  //   );
  //   await checkAlertMessage(
  //     operatorsPage.page,
  //     operatorsPage.newOperatorMustBeApprovedAlert,
  //   );

  //   await rejectButton.first().click(); // clicking operator rejection
  //   await expect(modal).toBeVisible();
  //   await checkLocatorsVisibility(operatorsPage.page, [
  //     modalConfirmButton,
  //     modalCancelButton,
  //   ]);
  //   await modalConfirmButton.click();
  //   await checkAlertMessage(
  //     operatorsPage.page,
  //     operatorsPage.declinedOperatorAlert,
  //   );

  //   // 🧪 cas_admin is not allowed to approve an admin access request if the Operator has been Declined in the first form section
  //   await operatorsPage.notAllowedToDeclineAdminRequest(
  //     modal,
  //     modalConfirmButton,
  //     modalCancelButton,
  //   );
  //   await checkAlertMessage(
  //     operatorsPage.page,
  //     operatorsPage.newOperatorMustBeApprovedAlert,
  //     1,
  //   );

  //   // 🔙 Navigate back to the operators table
  //   await operatorsPage.clickOperatorsLink();

  //   // 🧪 cas_admin is able to Approve admin request
  //   await clickViewDetailsButton(operatorsPage.page, 5); // PENDING admin request (Existing operator)

  //   // Operator information header is collapsed
  //   await checkFormHeaderIsCollapsed(
  //     operatorsPage.page,
  //     "Operator Information",
  //   );

  //   // Make sure only one approve button and one reject button are visible
  //   expect(await approveButton.all()).toHaveLength(1); // only one approve button for admin request
  //   expect(await rejectButton.all()).toHaveLength(1); // only one reject button for admin request

  //   await approveButton.click(); // clicking admin access request approval
  //   await expect(modal).toBeVisible();
  //   await checkLocatorsVisibility(operatorsPage.page, [
  //     modalConfirmButton,
  //     modalCancelButton,
  //   ]);
  //   await modalConfirmButton.click();
  //   await checkAlertMessage(
  //     operatorsPage.page,
  //     operatorsPage.approvedPrimeAdminAlert,
  //   );

  //   // 🔙 Navigate back to the operators table
  //   await operatorsPage.clickOperatorsLink();

  //   // 🧪 cas_admin is able to Decline admin request
  //   await clickViewDetailsButton(operatorsPage.page, 9); // PENDING admin request (Existing operator)

  //   await rejectButton.click(); // clicking admin access request rejection
  //   await expect(modal).toBeVisible();
  //   await checkLocatorsVisibility(operatorsPage.page, [
  //     modalConfirmButton,
  //     modalCancelButton,
  //   ]);
  //   await modalConfirmButton.click();
  //   await checkAlertMessage(
  //     operatorsPage.page,
  //     operatorsPage.declinedPrimeAdminAlert,
  //   );
  // });
  test("Operations Tile workflow", async ({ page }) => {
    // 🛸 Navigate to operations tile page
    const dashboardPage = new DashboardPOM(page);
    const operationsPage = new OperationsPOM(page);
    await dashboardPage.route();
    await dashboardPage.clickOperationsTile();
    await operationsPage.urlIsCorrect();
    await operationsPage.operationsTableIsVisible();

    // 🧪 cas_admin is able to view operations table with the following columns
    await tableColumnNamesAreCorrect(operationsPage.page, [
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
      "Declined",
      "Pending",
    ]);

    // // 🧪 cas_admin is able to see "Approve", "Decline", or "Request Changes" on a Pending operation
    // await clickViewDetailsButton(operationsPage.page, 3); // PENDING operation

    // // Check that all form fields are disabled and not editable
    // const pendingOperationFormFields = await getAllFormInputs(
    //   operationsPage.page,
    // );
    // await disabledAndNotEditable(pendingOperationFormFields);

    // // Get and check the buttons are visible
    // const requestChangesButton = await operationsPage.getRequestChangesButton();
    // const approveButton = await getApproveButton(operationsPage.page);
    // const rejectButton = await getRejectButton(operationsPage.page);
    // await checkLocatorsVisibility(operationsPage.page, [
    //   requestChangesButton,
    //   approveButton,
    //   rejectButton,
    // ]);

    // // 🧪 cas_admin is able to click "Request Changes" and subsequently reverse this action on a Pending operation
    // await requestChangesButton.click();
    // const confirmChangeRequestButton =
    //   await operationsPage.getConfirmChangeRequestButton();
    // const cancelChangeRequestButton =
    //   await operationsPage.getCancelChangeRequestButton();
    // await checkLocatorsVisibility(operationsPage.page, [
    //   confirmChangeRequestButton,
    //   cancelChangeRequestButton,
    // ]);
    // await confirmChangeRequestButton.click();
    // const undoChangeRequestButton =
    //   await operationsPage.getUndoChangeRequestButton();
    // await expect(undoChangeRequestButton).toBeVisible();
    // await undoChangeRequestButton.click();

    // // 🧪 cas_admin is able to click "Approve" on a Pending operation and triggers the generation of a BORO ID
    // await approveButton.click();
    // const modal = await getModal(operationsPage.page);
    // await expect(modal).toBeVisible();
    // // Modal has a confirm and cancel button
    // const modalConfirmButton = await getModalConfirmButton(modal);
    // const modalCancelButton = await getModalCancelButton(modal);
    // checkLocatorsVisibility(operationsPage.page, [
    //   modalConfirmButton,
    //   modalCancelButton,
    // ]);

    // await modalConfirmButton.click();
    // await expect(modal).not.toBeVisible();
    // await expect(operationsPage.page.locator(".MuiAlert-message")).toHaveText(
    //   "You have approved the request for carbon tax exemption.",
    // );

    // // 🔙 Navigate back to the operations table
    // await operationsPage.clickOperationsLink();

    // // 🧪 cas_admin is able to click "View Details" on any operation and see detailed info about it (read only)
    // await clickViewDetailsButton(operationsPage.page); // APPROVED operation

    // // Make sure the review buttons are not visible when viewing an approved operation
    // await checkLocatorsVisibility(
    //   operationsPage.page,
    //   [requestChangesButton, approveButton, rejectButton],
    //   false,
    // );

    // await operationsPage.clickExpandAllButton();
    // await checkFormHeaders(operationsPage.page, [
    //   "Operator Information",
    //   "Operation Information",
    //   "Point of Contact",
    //   "Statutory Declaration and Disclaimer",
    // ]);

    // // Check that all form fields are disabled and not editable
    // const approvedOperationFormFields = await getAllFormInputs(
    //   operationsPage.page,
    // );
    // await disabledAndNotEditable(approvedOperationFormFields);

    // //🧪 cas_admin is able to Preview the Statutory Declaration PDF in any Operation form
    // await downloadPDF(operationsPage.page, "Preview", "mock_file.pdf");

    // await operationsPage.clickCollapseAllButton();

    // // Approved operation message on top of the form
    // await operationsPage.operationApprovedMessageIsVisible();

    // // 🔙 Navigate back to the operations table
    // await operationsPage.clickOperationsLink();

    // 🧪 cas_admin is able to click "Decline" on a Declined operation
    await clickViewDetailsButton(operationsPage.page, 3); // DECLINED operation

    // TESTING: Expand all form sections to see the form fields
    await operationsPage.clickExpandAllButton();

    // // Make sure the review buttons are not visible when viewing an approved operation
    // await checkLocatorsVisibility(
    //   operationsPage.page,
    //   [requestChangesButton, approveButton, rejectButton],
    //   false,
    // );

    // // Check that all form fields are disabled and not editable
    // const declinedOperationFormFields = await getAllFormInputs(
    //   operationsPage.page,
    // );
    // await disabledAndNotEditable(declinedOperationFormFields);

    // await rejectButton.click();
    // await checkLocatorsVisibility(operationsPage.page, [
    //   modal,
    //   modalConfirmButton,
    //   modalCancelButton,
    // ]);
    // await modalConfirmButton.click();
    // await expect(modal).not.toBeVisible();
    // await operationsPage.operationDeclinedMessageIsVisible();
  });

  test("Report a Problem Tile workflow", async ({ page }) => {
    // 🛸 Navigate to dashboard page
    const dashboardPage = new DashboardPOM(page);
    await dashboardPage.route();
    // 🧪 Assert that the current URL ends with "(authenticated)/dashboard"
    await dashboardPage.urlIsCorrect();
    // 🧪 has a mailto: link on it
    await expect(dashboardPage.reportProblemLink).toHaveAttribute(
      "href",
      /mailto:GHGRegulator@gov.bc.ca/i,
    );
  });
});

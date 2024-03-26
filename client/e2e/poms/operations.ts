/**
 * 📖 https://playwright.dev/docs/pom
 * Page objects model (POM) simplify test authoring by creating a higher-level API
 * POM simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition. *
 */
import { Locator, Page, expect } from "@playwright/test";
// ☰ Enums
import {
  ActionClick,
  AppRoute,
  AriaLabel,
  DataTestID,
  FormSection,
  OperationStatus,
  TableDataField,
  UserRole,
} from "@/e2e/utils/enums";
// 🛠️ Helpers
import {
  checkAlertMessage,
  checkColumnTextVisibility,
  checkFormFieldsReadOnly,
  checkFormHeaders,
  checkLocatorsVisibility,
  downloadPDF,
  getAllFormInputs,
  getTableRow,
  tableColumnNamesAreCorrect,
} from "@/e2e/utils/helpers";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

export class OperationsPOM {
  readonly page: Page;

  readonly url: string = process.env.E2E_BASEURL + AppRoute.OPERATIONS;

  readonly btnApprove: Locator;

  readonly btnDecline: Locator;

  readonly btnExpandAll: Locator;

  readonly btnRequestChange: Locator;

  readonly btnRequestChangeCancel: Locator;

  readonly btnRequestChangeConfirm: Locator;

  readonly btnRequestChangeUndo: Locator;

  readonly btnViewDetail: Locator;

  readonly btnCancelModal: Locator;

  readonly btnConfirmModal: Locator;

  readonly buttonAdd: Locator;

  readonly buttonSaveAndContinue: Locator;

  readonly buttonSubmit: Locator;

  readonly formSectionOperation: Locator;

  readonly formSectionOperator: Locator;

  readonly formSectionContact: Locator;

  readonly formSectionStatutory: Locator;

  readonly linkOperations: Locator;

  readonly modal: Locator;

  readonly msgInternal: Locator;

  readonly operationApprovedMessage: Locator;

  readonly operationDeclinedMessage: Locator;

  readonly table: Locator;

  readonly internalNote =
    /Once “Approved,” a B.C. OBPS Regulated Operation ID will be issued for the operation/i;

  readonly alertApproved =
    /You have approved the request for carbon tax exemption./i;

  readonly alertDecline =
    /You have declined the request for carbon tax exemption./i;

  constructor(page: Page) {
    this.page = page;
    this.btnApprove = page.locator(
      `button[aria-label="${AriaLabel.APPLICATION_APPROVE}"]`
    );
    this.btnDecline = page.locator(
      `button[aria-label="${AriaLabel.APPLICATION_REJECT}"]`
    );
    this.btnExpandAll = page.getByRole("button", {
      name: ActionClick.EXPAND_ALL,
    });
    this.btnRequestChange = page.locator(
      `button[aria-label="${AriaLabel.APPLICATION_REQUEST_CHANGE}"]`
    );
    this.btnRequestChangeCancel = page.locator(
      `button[aria-label="${AriaLabel.APPLICATION_REQUEST_CHANGE_CANCEL}"]`
    );
    this.btnRequestChangeConfirm = page.locator(
      `button[aria-label="${AriaLabel.APPLICATION_REQUEST_CHANGE_CONFIRM}"]`
    );
    this.btnRequestChangeUndo = page.locator(
      `button[aria-label="${AriaLabel.APPLICATION_REQUEST_CHANGE_UNDO}"]`
    );
    this.btnViewDetail = page.getByRole("link", {
      name: ActionClick.VIEW_DETAILS,
    });
    this.buttonAdd = page.getByRole("button", {
      name: /add operation/i,
    });
    this.buttonSaveAndContinue = page.getByRole("button", {
      name: /save and continue/i,
    });
    this.buttonSubmit = page.getByRole("button", {
      name: /submit/i,
    });
    this.formSectionOperation = page.getByRole("button", {
      name: FormSection.INFO_OPERATION,
    });
    this.formSectionOperator = page.getByRole("button", {
      name: FormSection.INFO_OPERATOR,
    });
    this.formSectionContact = page.getByRole("button", {
      name: FormSection.INFO_CONTACT,
    });
    this.formSectionStatutory = page.getByRole("button", {
      name: FormSection.INFO_STATUTORY,
    });
    this.linkOperations = page.getByRole("link", {
      name: ActionClick.OPERATIONS,
    });
    this.modal = page.locator(DataTestID.MODAL);
    this.btnCancelModal = this.modal.locator(
      `button[aria-label="${AriaLabel.MODAL_CANCEL}"]`
    );
    this.btnConfirmModal = this.modal.locator(
      `button[aria-label="${AriaLabel.MODAL_CONFIRM}"]`
    );
    this.msgInternal = page.getByText(this.internalNote);
    this.operationApprovedMessage = page.locator(
      DataTestID.OPERATION_APPROVED_MESSAGE
    );
    this.operationDeclinedMessage = page.locator(
      DataTestID.OPERATION_DECLINED_MESSAGE
    );

    this.table = page.locator(DataTestID.GRID);
  }

  async route() {
    await this.page.goto(this.url);
  }

  async urlIsCorrect() {
    const path = this.url;
    const currentUrl = this.page.url();
    expect(currentUrl.toLowerCase()).toMatch(path.toLowerCase());
  }

  async tableIsVisible() {
    await expect(this.table).toBeVisible();
  }

  async tableHasExpectedColumns() {
    await tableColumnNamesAreCorrect(this.page, [
      "BC GHG ID",
      "Operator",
      "Operation",
      "Submission Date",
      "BORO ID",
      "Application Status",
      "Action",
    ]);
  }

  async tableHasExpectedColumnValues(role: string, column: string) {
    let expectedValues: string[] = [];
    switch (column) {
      case TableDataField.STATUS:
        switch (role) {
          case UserRole.CAS_ADMIN:
            expectedValues = [
              OperationStatus.PENDING,
              OperationStatus.APPROVED,
              OperationStatus.DECLINED,
            ];
            break;
        }
        break;
    }

    // Check for visibility of values in the column
    await checkColumnTextVisibility(this.table, column, expectedValues);
  }

  async viewIsCorrect(role: string) {
    switch (role) {
      case UserRole.INDUSTRY_USER_ADMIN:
      case UserRole.INDUSTRY_USER:
        // later
        break;
      case UserRole.CAS_ADMIN:
        await expect(this.msgInternal).toBeVisible();
        await expect(this.buttonAdd).not.toBeVisible();
        break;
    }
  }

  async detailsHasExpectedUX(status: string) {
    // Locate row containing the status
    const row = await getTableRow(
      this.table,
      `[role="cell"][data-field="${TableDataField.STATUS}"]:has-text("${status}")`
    );

    // Click the `View Detail` for this row
    await row.getByRole("link", { name: ActionClick.VIEW_DETAILS }).click();

    // Assert headers are visible
    await checkFormHeaders(this.page, [
      FormSection.INFO_OPERATION,
      FormSection.INFO_OPERATOR,
      FormSection.INFO_CONTACT,
      FormSection.INFO_STATUTORY,
    ]);

    // Assert headers are collapsed
    const sections = [
      this.formSectionOperation,
      this.formSectionOperator,
      this.formSectionContact,
      this.formSectionStatutory,
    ];
    for (const section of sections) {
      await expect(section).toHaveAttribute("aria-expanded", "false");
    }

    // Assert that all form fields are visible, disabled and not editable
    await this.btnExpandAll.click();
    const allFormFields = await getAllFormInputs(this.page);
    // Last input is the file widget input, which is not visible
    allFormFields.pop(); // Deletes the last item from the array
    await checkFormFieldsReadOnly(allFormFields);

    // Check buttons...
    switch (status) {
      case OperationStatus.APPROVED:
      case OperationStatus.DECLINED:
        // Make sure the review buttons are not visible
        await checkLocatorsVisibility(
          this.page,
          [this.btnApprove, this.btnDecline, this.btnRequestChange],
          false
        );
        break;
      case OperationStatus.PENDING:
        // Get and check the buttons are visible
        await checkLocatorsVisibility(this.page, [
          this.btnApprove,
          this.btnDecline,
          this.btnRequestChange,
        ]);
        break;
    }

    // 🔙 Navigate back to the table
    await this.linkOperations.click();
    await this.table;
  }

  async detailsHasExpectedWorkflow(
    role: string,
    status: string,
    caseIndex: number
  ) {
    // Find a Pending row
    const row = await getTableRow(
      this.table,
      `[role="cell"][data-field="${TableDataField.STATUS}"]:has-text("${status}")`
    );
    await row.getByRole("link", { name: ActionClick.VIEW_DETAILS }).click();

    switch (role) {
      case UserRole.CAS_ADMIN:
        switch (caseIndex) {
          case 1:
            // Status Pending
            // Workflow: Request Changes, Undo (Request Changes), Approve
            // - can request changes
            // - can undo request changes
            // - can approve

            // cas_admin can Request Changes
            await this.btnRequestChange.click();
            await checkLocatorsVisibility(this.page, [
              this.btnRequestChangeConfirm,
              this.btnRequestChangeCancel,
            ]);
            await this.btnRequestChangeConfirm.click();
            await expect(this.btnRequestChangeUndo).toBeVisible();

            // cas_admin can undo Request Changes
            await this.btnRequestChangeUndo.click();
            await expect(this.btnRequestChange).toBeVisible();

            // cas_admin can Approve and triggers the generation of a BORO ID
            await this.workflowReviewAction(
              this.btnApprove,
              this.btnConfirmModal,
              this.alertApproved
            );
            await expect(this.operationApprovedMessage).toBeVisible();
            break;
          case 2:
            // Status Pending
            // Workflow: Decline
            // - can decline

            // cas_admin can Decline
            await this.workflowReviewAction(
              this.btnDecline,
              this.btnConfirmModal,
              this.alertDecline
            );
            await expect(this.operationDeclinedMessage).toBeVisible();
            break;
          case 3:
            // Status Approved
            // Workflow: Preview the Statutory Declaration PDF

            // cas_admin is able to Preview the Statutory Declaration PDF in any Operation form
            await this.formSectionStatutory.click();
            await downloadPDF(this.page, "Preview", "mock_file.pdf");
            break;
        }
    }

    // Navigate back to the table
    await this.linkOperations.click();
    await this.table;
  }

  async workflowReviewAction(
    btnApplication: Locator,
    btnModal: Locator,
    alertMessage: string | RegExp,
    index: number = 0
  ) {
    await btnApplication.click();
    await expect(this.modal).toBeVisible();
    await checkLocatorsVisibility(this.page, [
      this.btnConfirmModal,
      this.btnCancelModal,
    ]);
    await btnModal.click();
    await checkAlertMessage(this.page, alertMessage, index);
  }
}

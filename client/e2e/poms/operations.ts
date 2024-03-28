/**
 * 📖 https://playwright.dev/docs/pom
 * Page objects model (POM) simplify test authoring by creating a higher-level API
 * POM simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition. *
 */
import { Locator, Page, expect } from "@playwright/test";
// 🧩  Constants
import { headersOperations } from "@/e2e/utils/constants";
// ☰ Enums
import {
  AppRoute,
  AriaLabel,
  ButtonText,
  DataTestID,
  FormSection,
  LinkSrc,
  MessageTextOperations,
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

  readonly buttonApprove: Locator;

  readonly buttonDecline: Locator;

  readonly buttonExpandAll: Locator;

  readonly buttonRequestChange: Locator;

  readonly buttonRequestChangeCancel: Locator;

  readonly buttonRequestChangeConfirm: Locator;

  readonly buttonRequestChangeUndo: Locator;

  readonly buttonViewDetail: Locator;

  readonly buttonCancelModal: Locator;

  readonly buttonConfirmModal: Locator;

  readonly buttonAdd: Locator;

  readonly buttonSaveAndContinue: Locator;

  readonly buttonSubmit: Locator;

  readonly formSectionOperation: Locator;

  readonly formSectionOperator: Locator;

  readonly formSectionContact: Locator;

  readonly formSectionStatutory: Locator;

  readonly linkOperations: Locator;

  readonly modal: Locator;

  readonly messageInternal: Locator;

  readonly operationApprovedMessage: Locator;

  readonly operationDeclinedMessage: Locator;

  readonly table: Locator;

  readonly internalNote = MessageTextOperations.NOTE_INTERNAL;

  readonly alertApproved =
    MessageTextOperations.ALERT_CARBON_TAX_EXEMPTION_APPROVED;

  readonly alertDeclined =
    MessageTextOperations.ALERT_CARBON_TAX_EXEMPTION_DECLINED;

  constructor(page: Page) {
    this.page = page;
    this.buttonAdd = page.getByRole("button", {
      name: ButtonText.ADD_OPERATION,
    });
    this.buttonApprove = page.locator(
      `button[aria-label="${AriaLabel.APPLICATION_APPROVE}"]`
    );
    this.buttonDecline = page.locator(
      `button[aria-label="${AriaLabel.APPLICATION_REJECT}"]`
    );
    this.buttonExpandAll = page.getByRole("button", {
      name: ButtonText.EXPAND_ALL,
    });
    this.buttonRequestChange = page.locator(
      `button[aria-label="${AriaLabel.APPLICATION_REQUEST_CHANGE}"]`
    );
    this.buttonRequestChangeCancel = page.locator(
      `button[aria-label="${AriaLabel.APPLICATION_REQUEST_CHANGE_CANCEL}"]`
    );
    this.buttonRequestChangeConfirm = page.locator(
      `button[aria-label="${AriaLabel.APPLICATION_REQUEST_CHANGE_CONFIRM}"]`
    );
    this.buttonRequestChangeUndo = page.locator(
      `button[aria-label="${AriaLabel.APPLICATION_REQUEST_CHANGE_UNDO}"]`
    );
    this.buttonViewDetail = page.getByRole("link", {
      name: ButtonText.VIEW_DETAILS,
    });
    this.buttonSaveAndContinue = page.getByRole("button", {
      name: ButtonText.SAVE_CONTINUE,
    });
    this.buttonSubmit = page.getByRole("button", {
      name: ButtonText.SUBMIT,
    });
    this.formSectionOperation = page.getByRole("button", {
      name: FormSection.INFO_OPERATION,
    });
    this.formSectionOperator = page.getByRole("button", {
      name: FormSection.INFO_OPERATOR,
    });
    this.formSectionContact = page.getByRole("button", {
      name: FormSection.INFO_POINT_CONTACT,
    });
    this.formSectionStatutory = page.getByRole("button", {
      name: FormSection.INFO_STATUTORY,
    });
    this.linkOperations = page.getByRole("link", {
      name: ButtonText.OPERATIONS,
    });
    this.modal = page.locator(DataTestID.MODAL);
    this.buttonCancelModal = this.modal.locator(
      `button[aria-label="${ButtonText.CANCEL}"]`
    );
    this.buttonConfirmModal = this.modal.locator(
      `button[aria-label="${ButtonText.CONFIRM}"]`
    );
    this.messageInternal = page.getByText(this.internalNote);
    this.operationApprovedMessage = page.locator(
      DataTestID.OPERATION_APPROVED_MESSAGE
    );
    this.operationDeclinedMessage = page.locator(
      DataTestID.OPERATION_DECLINED_MESSAGE
    );

    this.table = page.locator(DataTestID.GRID);
  }

  // ###  Actions ###

  async clickAddOperationButton() {
    // Click Add Operation button
    await this.buttonAdd.click();
  }

  async route() {
    await this.page.goto(this.url);
  }

  // ### Assertions ###

  async clickViewDetailsButton(index: number = 0) {
    // Optionally pass the index since there are multiple view details buttons in the fixtures
    const viewDetailsButtons = await this.page
      .getByRole("link", {
        name: /view details/i,
      })
      .all();
    await viewDetailsButtons[index].click();
  }

  async detailsHasExpectedUX(status: string) {
    // Locate row containing the status
    const row = await getTableRow(
      this.table,
      `[role="cell"][data-field="${TableDataField.STATUS}"]:has-text("${status}")`
    );

    // Click the `View Detail` for this row
    await row.getByRole("link", { name: ButtonText.VIEW_DETAILS }).click();

    // Assert headers are visible
    await checkFormHeaders(this.page, [
      FormSection.INFO_OPERATION,
      FormSection.INFO_OPERATOR,
      FormSection.INFO_POINT_CONTACT,
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
    await this.buttonExpandAll.click();
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
          [this.buttonApprove, this.buttonDecline, this.buttonRequestChange],
          false
        );
        break;
      case OperationStatus.PENDING:
        // Get and check the buttons are visible
        await checkLocatorsVisibility(this.page, [
          this.buttonApprove,
          this.buttonDecline,
          this.buttonRequestChange,
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
    await row.getByRole("link", { name: ButtonText.VIEW_DETAILS }).click();

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
            await this.buttonRequestChange.click();
            await checkLocatorsVisibility(this.page, [
              this.buttonRequestChangeConfirm,
              this.buttonRequestChangeCancel,
            ]);
            await this.buttonRequestChangeConfirm.click();
            await expect(this.buttonRequestChangeUndo).toBeVisible();

            // cas_admin can undo Request Changes
            await this.buttonRequestChangeUndo.click();
            await expect(this.buttonRequestChange).toBeVisible();

            // cas_admin can Approve and triggers the generation of a BORO ID
            await this.workflowReviewAction(
              this.buttonApprove,
              this.buttonConfirmModal,
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
              this.buttonDecline,
              this.buttonConfirmModal,
              this.alertDeclined
            );
            await expect(this.operationDeclinedMessage).toBeVisible();
            break;
          case 3:
            // Status Approved
            // Workflow: Preview the Statutory Declaration PDF

            // cas_admin is able to Preview the Statutory Declaration PDF in any Operation form
            await this.formSectionStatutory.click();
            await downloadPDF(
              this.page,
              ButtonText.PDF_PREVIEW,
              LinkSrc.PDF_FILE
            );
            break;
        }
    }

    // Navigate back to the table
    await this.linkOperations.click();
    await this.table;
  }

  async tableHasExpectedColumns(role: string) {
    await tableColumnNamesAreCorrect(this.page, headersOperations[role]);
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

  async urlIsCorrect() {
    const path = this.url;
    const currentUrl = this.page.url();
    expect(currentUrl.toLowerCase()).toMatch(path.toLowerCase());
  }

  async tableIsVisible() {
    await expect(this.table).toBeVisible();
  }

  async viewIsCorrect(role: string) {
    switch (role) {
      case UserRole.INDUSTRY_USER_ADMIN:
      case UserRole.INDUSTRY_USER:
        // later
        break;
      case UserRole.CAS_ADMIN:
        await expect(this.messageInternal).toBeVisible();
        await expect(this.buttonAdd).not.toBeVisible();
        break;
    }
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
      this.buttonConfirmModal,
      this.buttonCancelModal,
    ]);
    await btnModal.click();
    await checkAlertMessage(this.page, alertMessage, index);
  }
}

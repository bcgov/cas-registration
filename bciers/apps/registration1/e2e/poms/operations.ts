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
  ButtonText,
  DataTestID,
  FormSection,
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
  checkLocatorsVisibility,
  checkRequiredFieldValue,
  getAllFormInputs,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getFieldRequired,
  getTableColumnTextValues,
  getTableRowByCellSelector,
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

  readonly formSectionStatutoryDisclaimer: Locator;

  readonly linkOperations: Locator;

  readonly modal: Locator;

  readonly messageInternal: Locator;

  readonly messageOperationApproved: Locator;

  readonly messageOperationDeclined: Locator;

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
    this.buttonApprove = page.getByRole("button", {
      name: ButtonText.APPLICATION_APPROVE,
    });
    this.buttonDecline = page.getByRole("button", {
      name: ButtonText.APPLICATION_REJECT,
    });
    this.buttonExpandAll = page.getByRole("button", {
      name: ButtonText.EXPAND_ALL,
    });
    this.buttonRequestChange = page.getByRole("button", {
      name: ButtonText.APPLICATION_REQUEST_CHANGE,
    });
    this.buttonRequestChangeCancel = page.getByRole("button", {
      name: ButtonText.APPLICATION_REQUEST_CHANGE_CANCEL,
    });
    this.buttonRequestChangeConfirm = page.getByRole("button", {
      name: ButtonText.APPLICATION_REQUEST_CHANGE_CONFIRM,
    });
    this.buttonRequestChangeUndo = page.getByRole("button", {
      name: ButtonText.APPLICATION_REQUEST_CHANGE_UNDO,
    });
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
    this.formSectionStatutoryDisclaimer = page.getByRole("button", {
      name: FormSection.INFO_STATUTORY_DISCLAIMER,
    });
    this.linkOperations = page.getByRole("link", {
      name: ButtonText.OPERATIONS,
    });
    this.modal = page.getByTestId(DataTestID.MODAL);
    this.buttonCancelModal = page.getByRole("button", {
      name: ButtonText.CANCEL,
    });
    this.buttonConfirmModal = page.getByRole("button", {
      name: ButtonText.CONFIRM,
    });
    this.messageInternal = page.getByText(this.internalNote);
    this.messageOperationApproved = page.getByTestId(
      DataTestID.OPERATION_APPROVED_MESSAGE,
    );
    this.messageOperationDeclined = page.getByTestId(
      DataTestID.OPERATION_DECLINED_MESSAGE,
    );

    this.table = page.locator(DataTestID.GRID);
  }

  // ###  Actions ###

  async clickAddOperationButton() {
    // Click Add Operation button
    await this.buttonAdd.click();
  }

  async clickViewDetailsButton(index: number = 0) {
    // Optionally pass the index since there are multiple view details buttons in the fixtures
    const viewDetailsButtons = await this.page
      .getByRole("link", {
        name: ButtonText.VIEW_DETAILS,
      })
      .all();
    await viewDetailsButtons[index].click();
  }

  async clickViewDetailsButtonByOperationName(
    page: any,
    operationName: string,
  ) {
    const row = await getTableRowByCellSelector(
      this.table,
      `[data-field="${TableDataField.NAME}"]:has-text("${operationName}")`,
    );
    await page.waitForTimeout(5000);
    // Click the `View Detail` for this row
    await row.getByRole("link", { name: ButtonText.VIEW_DETAILS }).click();
  }

  async navigateBack() {
    // Navigate back to the table
    await this.linkOperations.click();
  }

  async route() {
    await this.page.goto(this.url);
  }

  // ### Assertions ###

  async formHasExpectedUX(status: string) {
    // Locate row containing the status
    const row = await getTableRowByCellSelector(
      this.table,
      `[data-field="${TableDataField.STATUS}"]:has-text("${status}")`,
    );

    // Click the `View Detail` for this row
    await row.getByRole("link", { name: ButtonText.VIEW_DETAILS }).click();

    // Assert headers are visible
    await this.formHasHeaders();

    // Assert headers are collapsed
    await this.formHasHeadersCollapsed();

    // Assert that all form fields are visible, disabled and not editable
    await this.buttonExpandAll.click();
    const allFormFields = await getAllFormInputs(this.page);
    // Last input is the file widget input, which is not visible
    allFormFields.pop(); // Deletes the last item from the array
    await checkFormFieldsReadOnly(allFormFields);

    // Check buttons, required fields, messages
    switch (status) {
      case OperationStatus.APPROVED:
      case OperationStatus.DECLINED:
        // Check the buttons are NOT visible
        await checkLocatorsVisibility(
          this.page,
          [this.buttonApprove, this.buttonDecline, this.buttonRequestChange],
          false,
        );
        // Check required fields have value
        await checkRequiredFieldValue(this.page);
        // Check status message
        switch (status) {
          case OperationStatus.APPROVED:
            await expect(this.messageOperationApproved).toBeVisible();
            break;
          case OperationStatus.DECLINED:
            await expect(this.messageOperationDeclined).toBeVisible();
            break;
        }
        break;
      case OperationStatus.PENDING:
        // Check the buttons are visible
        await checkLocatorsVisibility(this.page, [
          this.buttonApprove,
          this.buttonDecline,
          this.buttonRequestChange,
        ]);
        break;
    }
  }

  async formHasExpectedWorkflow(
    role: string,
    status: string,
    workflowNumber: number,
  ) {
    // Find a row by status
    const row = await getTableRowByCellSelector(
      this.table,
      `[data-field="${TableDataField.STATUS}"]:has-text("${status}")`,
    );
    await row.getByRole("link", { name: ButtonText.VIEW_DETAILS }).click();

    switch (role) {
      case UserRole.CAS_ADMIN:
      case UserRole.CAS_ANALYST:
        switch (workflowNumber) {
          case 1:
            // Status Pending
            // Workflow: Request Changes, Undo (Request Changes), Approve
            // - can request changes
            // - can undo request changes
            // - can approve

            // cas_admin; cas_analyst can Request Changes
            await this.buttonRequestChange.click();
            await checkLocatorsVisibility(this.page, [
              this.buttonRequestChangeConfirm,
              this.buttonRequestChangeCancel,
            ]);
            await this.buttonRequestChangeConfirm.click();
            await expect(this.buttonRequestChangeUndo).toBeVisible();

            // cas_admin; cas_analyst can undo Request Changes
            await this.buttonRequestChangeUndo.click();
            await expect(this.buttonRequestChange).toBeVisible();

            // cas_admin; cas_analyst can Approve and triggers the generation of a BORO ID
            await this.workflowReviewAction(
              this.buttonApprove,
              this.buttonConfirmModal,
              this.alertApproved,
            );
            // FIXME FOR CI
            // await expect(this.messageOperationApproved).toBeVisible();
            break;
          case 2:
            // Status Pending
            // Workflow: Decline
            // - can decline

            // cas_admin; cas_analyst can Decline
            await this.workflowReviewAction(
              this.buttonDecline,
              this.buttonConfirmModal,
              this.alertDeclined,
            );
            break;
          case 3:
            // Status Approved
            // Workflow: Preview the Statutory Declaration PDF

            // cas_admin; cas_analyst is able to Preview the Statutory Declaration PDF in any Operation form
            await this.formSectionStatutoryDisclaimer.click();
            // FIXME FOR CI
            /* await downloadPDF(
              this.page,
              ButtonText.PDF_PREVIEW,
              LinkSrc.PDF_FILE
            );
            */
            break;
        }
    }

    // 🛸 Navigate back
    await this.navigateBack();
    // 🔍 Assert table is visible
    await this.tableIsVisible();
  }

  async formHasHeaders() {
    await expect(this.formSectionOperation).toBeVisible();
    await expect(this.formSectionOperator).toBeVisible();
    await expect(this.formSectionContact).toBeVisible();
    await expect(this.formSectionStatutoryDisclaimer).toBeVisible();
  }

  async formHasHeadersCollapsed() {
    // Assert headers are collapsed
    const sections = [
      this.formSectionOperation,
      this.formSectionOperator,
      this.formSectionContact,
      this.formSectionStatutoryDisclaimer,
    ];
    for (const section of sections) {
      await expect(section).toHaveAttribute("aria-expanded", "false");
    }
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
          case UserRole.CAS_ANALYST:
            expectedValues = [
              OperationStatus.PENDING,
              OperationStatus.APPROVED,
              OperationStatus.DECLINED,
              OperationStatus.CHANGES_REQUESTED,
              // OperationStatus.REGISTERED,
              // // Below values are not possible in Registration1
              // OperationStatus.CLOSED,
              // OperationStatus.TEMPORARILY_SHUTDOWN,
              // OperationStatus.TRANSFERRED,
            ];
            break;
        }
        break;
    }

    // Check for visibility of values in the column
    await checkColumnTextVisibility(this.table, column, expectedValues);

    // Ensure only expected values are in grid
    const allStatusValues = await getTableColumnTextValues(this.table, column);
    const unexpectedValues = allStatusValues.filter(
      (value) => !expectedValues.includes(value),
    );
    await expect(unexpectedValues.length).toBe(0);
  }

  async tableIsVisible() {
    await expect(this.table).toBeVisible();
  }

  async urlIsCorrect() {
    const path = this.url;
    const currentUrl = this.page.url();
    expect(currentUrl.toLowerCase()).toMatch(path.toLowerCase());
  }

  async viewIsCorrect(role: string) {
    switch (role) {
      case UserRole.INDUSTRY_USER_ADMIN:
      case UserRole.INDUSTRY_USER:
        // later
        break;
      case UserRole.CAS_ADMIN:
      case UserRole.CAS_ANALYST:
        await expect(this.messageInternal).toBeVisible();
        await expect(this.buttonAdd).not.toBeVisible();
        break;
    }
  }

  async workflowReviewAction(
    btnApplication: Locator,
    btnModal: Locator,
    alertMessage: string | RegExp,
    index: number = 0,
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

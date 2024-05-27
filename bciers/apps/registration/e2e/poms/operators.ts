/**
 * 📖 https://playwright.dev/docs/pom
 * Page objects model (POM) simplify test authoring by creating a higher-level API
 * POM simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition. *
 */
import { Locator, Page, expect } from "@playwright/test";
// 🧩  Constants
import { headersOperators } from "@/e2e/utils/constants";
// ☰ Enums
import {
  ButtonText,
  AppRoute,
  FormSection,
  TableDataField,
  UserOperatorStatus,
  UserRole,
  DataTestID,
  MessageTextOperators,
  E2EValue,
} from "@/e2e/utils/enums";
// 🛠️ Helpers
import {
  checkColumnTextVisibility,
  checkLocatorsVisibility,
  getAllFormInputs,
  tableColumnNamesAreCorrect,
  checkFormFieldsReadOnly,
  checkAlertMessage,
  getTableRowByCellSelector,
  getTableColumnTextValues,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getFieldRequired,
  checkRequiredFieldValue,
} from "@/e2e/utils/helpers";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

export class OperatorsPOM {
  readonly page: Page;

  readonly url: string = process.env.E2E_BASEURL + AppRoute.OPERATORS;

  readonly buttonsApprove: Locator;

  readonly buttonsDecline: Locator;

  readonly buttonExpandAll: Locator;

  readonly buttonViewDetail: Locator;

  readonly buttonCancelModal: Locator;

  readonly buttonConfirmModal: Locator;

  readonly formSectionOperator: Locator;

  readonly formSectionUsers: Locator;

  readonly linkOperators: Locator;

  readonly modal: Locator;

  readonly messageInternal: Locator;

  readonly messageNewOperator: Locator;

  readonly table: Locator;

  constructor(page: Page) {
    this.page = page;
    this.buttonsApprove = page.getByRole("button", {
      name: ButtonText.APPLICATION_APPROVE,
    });
    this.buttonExpandAll = page.getByRole("button", {
      name: ButtonText.EXPAND_ALL,
    });
    this.buttonsDecline = page.getByRole("button", {
      name: ButtonText.APPLICATION_REJECT,
    });
    this.buttonViewDetail = page.getByRole("link", {
      name: ButtonText.VIEW_DETAILS,
    });
    this.formSectionOperator = page.getByRole("button", {
      name: FormSection.INFO_OPERATOR,
    });
    this.formSectionUsers = page.getByRole("button", {
      name: FormSection.INFO_USER,
    });
    this.linkOperators = page.getByRole("link", {
      name: ButtonText.OPERATORS,
    });
    this.modal = page.getByTestId(DataTestID.MODAL);
    this.buttonCancelModal = page.getByRole("button", {
      name: ButtonText.CANCEL,
    });
    this.buttonConfirmModal = page.getByRole("button", {
      name: ButtonText.CONFIRM,
    });
    this.messageInternal = page.getByText(MessageTextOperators.NOTE_INTERNAL);
    this.messageNewOperator = page.getByText(MessageTextOperators.NOTE_NEW);
    this.table = page.locator(DataTestID.GRID);
  }

  // ###  Actions ###
  async navigateBack() {
    // Navigate back to the table
    await this.linkOperators.click();
  }

  async route() {
    await this.page.goto(this.url);
  }

  async clickViewDetailsButtonByOperatorName(page: any, operationName: string) {
    const row = await getTableRowByCellSelector(
      this.table,
      `[data-field="${TableDataField.NAME}"]:has-text("${operationName}")`,
    );
    await page.waitForTimeout(5000);
    // Click the `View Detail` for this row
    await row.getByRole("link", { name: ButtonText.VIEW_DETAILS }).click();
  }

  // ###  Assertions ###

  async formHasExpectedUX(
    status: string,
    operatorLegalName: string | undefined = undefined,
  ) {
    let row;
    // The mock data contains some operators with the same status, so in these cases, we can select by the more specific Operator Legal Name instead
    if (operatorLegalName) {
      row = await getTableRowByCellSelector(
        this.table,
        `[data-field="${TableDataField.LEGAL_NAME}"]:has-text("${operatorLegalName}")`,
      );
    } else {
      row = await getTableRowByCellSelector(
        this.table,
        `[data-field="${TableDataField.STATUS}"]:has-text("${status}")`,
      );
    }

    // Click the `View Detail` for this status row
    await row.getByRole("link", { name: ButtonText.VIEW_DETAILS }).click();

    // Assert headers are visible
    await this.formHasHeaders();

    // Assert that all form fields are visible, disabled and not editable
    await this.buttonExpandAll.click();
    const allFormFields = await getAllFormInputs(this.page);
    await checkFormFieldsReadOnly(allFormFields);

    // Check buttons, required fields
    switch (status) {
      case UserOperatorStatus.APPROVED:
      case UserOperatorStatus.DECLINED:
        // Check the buttons are NOT visible
        await checkLocatorsVisibility(
          this.page,
          [this.buttonsApprove, this.buttonsDecline],
          false,
        );
        // Check required fields have value
        await checkRequiredFieldValue(this.page);
        break;
      case UserOperatorStatus.PENDING:
        // Get and check the buttons are visible (Multiple Approve and Decline buttons are visible)
        await checkLocatorsVisibility(this.page, [
          ...(await this.buttonsApprove.all()),
          ...(await this.buttonsDecline.all()),
        ]);
        expect(await this.buttonsApprove.count()).toBe(2);
        expect(await this.buttonsDecline.count()).toBe(2);
        break;
    }
  }

  async formHasExpectedWorkflow(role: string, workflowNumber: number) {
    switch (role) {
      case UserRole.CAS_ADMIN:
      case UserRole.CAS_ANALYST:
        // Find first row by operator, status
        // option over using get row by rows index which is a potentially fragile structural assumption
        switch (workflowNumber) {
          case 1:
            // Row: Operator New, Status Pending
            // Workflow: Approve new operator and admin request
            // - new operator message is visible
            // - cannot approve admin access request
            // - can approve operator
            // - can approve admin access request

            // Click the `View Detail` for first row by new operator, pending status
            await this.table
              .getByRole("row")
              .filter({ hasText: E2EValue.FIXTURE_OPERATOR_NEW })
              .filter({ hasText: UserOperatorStatus.PENDING })
              .getByRole("link", { name: ButtonText.VIEW_DETAILS })
              .first()
              .click();

            // New operator note is visible
            await expect(this.messageNewOperator).toBeVisible();

            // cas_admin; cas_analyst is not allowed to approve an admin access request if the Operator is new and hasn't been Approved yet
            await this.workflowReviewAction(
              this.buttonsApprove.last(),
              this.buttonConfirmModal,
              MessageTextOperators.ALERT_NEW_OPERATOR_NEEDS_APPROVE,
            );
            // cas_admin; cas_analyst is able to Approve new operator
            await this.workflowReviewAction(
              this.buttonsApprove.first(),
              this.buttonConfirmModal,
              MessageTextOperators.ALERT_OPERATOR_APPROVED,
            );
            // cas_admin; cas_analyst is able to Approve admin request
            await this.workflowReviewAction(
              this.buttonsApprove.last(),
              this.buttonConfirmModal,
              MessageTextOperators.ALERT_ADMIN_APPROVED,
              1,
            );
            break;
          case 2:
            // Row: Operator New, Status Pending
            // Workflow: Reject new operator
            // - new operator message is visible (tested with row index 2)
            // - cannot reject admin access request
            // - can reject operator

            // Click the `View Detail` for first row by new operator, pending status
            await this.table
              .getByRole("row")
              .filter({ hasText: E2EValue.FIXTURE_OPERATOR_NEW })
              .filter({ hasText: UserOperatorStatus.PENDING })
              .getByRole("link", { name: ButtonText.VIEW_DETAILS })
              .first()
              .click();

            // cas_admin; cas_analyst is not allowed to decline an admin access request if the Operator is new and hasn't been Approved yet
            await this.workflowReviewAction(
              this.buttonsDecline.last(),
              this.buttonConfirmModal,
              MessageTextOperators.ALERT_NEW_OPERATOR_NEEDS_APPROVE,
            );

            // cas_admin; cas_analyst is able to Reject new operator
            await this.workflowReviewAction(
              this.buttonsDecline.first(),
              this.buttonConfirmModal,
              MessageTextOperators.ALERT_OPERATOR_DECLINED,
            );

            // cas_admin; cas_analyst can't see Approve/Decline buttons if the Operator has been Declined in the first form section
            await checkLocatorsVisibility(
              this.page,
              [this.buttonsApprove, this.buttonsDecline],
              false,
            );
            break;
          case 3:
            // Row: Operator Existing, Status Pending
            // Workflow: Approve existing operator admin request
            // - new operator message is NOT visible
            // - Operator info section header is collapsed
            // - only admin request approve button/reject button are visible
            // - can reject admin access request

            // Click the `View Detail` for first row by existing operator, pending status
            await this.table
              .getByRole("row")
              .filter({ hasText: E2EValue.FIXTURE_OPERATOR_EXISTING })
              .filter({ hasText: UserOperatorStatus.PENDING })
              .getByRole("link", { name: ButtonText.VIEW_DETAILS })
              .first()
              .click();

            //  New operator note is NOT visible
            await expect(this.messageNewOperator).not.toBeVisible();

            // Operator information header is collapsed
            await expect(this.formSectionOperator).toHaveAttribute(
              "aria-expanded",
              "false",
            );

            // Make sure only admin approve/reject button are visible
            expect(await this.buttonsApprove.count()).toBe(1);
            expect(await this.buttonsDecline.count()).toBe(1);

            // cas_admin; cas_analyst is able to Approve admin request
            await this.workflowReviewAction(
              this.buttonsApprove.last(),
              this.buttonConfirmModal,
              MessageTextOperators.ALERT_ADMIN_APPROVED,
            );
            break;
          case 4:
            // Row: Operator Existing, Status Pending
            // Workflow: Reject existing operator admin request
            // - new operator message is NOT visible (tested with row index 5)
            // - Operator info section header is collapsed (tested with row index 5)
            // - only admin request approve button/reject button are visible (tested with row index 5)
            // - can reject admin access request

            // Click the `View Detail` for first row by existing operator, pending status
            await this.table
              .getByRole("row")
              .filter({ hasText: E2EValue.FIXTURE_OPERATOR_EXISTING })
              .filter({ hasText: UserOperatorStatus.PENDING })
              .getByRole("link", { name: ButtonText.VIEW_DETAILS })
              .first()
              .click();
            // cas_admin; cas_analyst is able to Reject admin request
            await this.workflowReviewAction(
              this.buttonsDecline.last(),
              this.buttonConfirmModal,
              MessageTextOperators.ALERT_ADMIN_DECLINED,
            );
            break;
        }
        // 🛸 Navigate back
        await this.navigateBack();
        // 🔍 Assert table is visible
        await this.tableIsVisible();
    }
  }

  async formHasHeaders() {
    await expect(this.formSectionUsers).toBeVisible();
    await expect(this.formSectionUsers).toBeVisible();
  }

  async tableIsVisible() {
    await expect(this.table).toBeVisible();
  }

  async tableHasExpectedColumns(role: string) {
    await tableColumnNamesAreCorrect(this.page, headersOperators[role]);
  }

  async tableHasExpectedColumnValues(role: string, column: string) {
    let expectedValues: string[] = [];
    switch (column) {
      case TableDataField.STATUS:
        switch (role) {
          case UserRole.CAS_ADMIN:
          case UserRole.CAS_ANALYST:
            expectedValues = [
              UserOperatorStatus.PENDING,
              UserOperatorStatus.APPROVED,
              UserOperatorStatus.DECLINED,
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

  async viewIsCorrect(role: string) {
    switch (role) {
      case UserRole.INDUSTRY_USER_ADMIN:
        // later
        break;
      case UserRole.CAS_ADMIN:
      case UserRole.CAS_ANALYST:
        await expect(this.messageInternal).toBeVisible();
        break;
    }
  }

  async urlIsCorrect() {
    const path = this.url;
    const currentUrl = this.page.url();
    expect(currentUrl.toLowerCase()).toMatch(path.toLowerCase());
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

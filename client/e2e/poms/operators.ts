/**
 * 📖 https://playwright.dev/docs/pom
 * Page objects model (POM) simplify test authoring by creating a higher-level API
 * POM simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition. *
 */
import { Locator, Page, expect } from "@playwright/test";
// ☰ Enums
import {
  ActionClick,
  AriaLabel,
  AppRoute,
  FormSection,
  TableDataField,
  UserOperatorStatus,
  UserRole,
  DataTestID,
} from "@/e2e/utils/enums";
// 🛠️ Helpers
import {
  checkColumnTextVisibility,
  checkFormHeaders,
  checkLocatorsVisibility,
  getAllFormInputs,
  tableColumnNamesAreCorrect,
  checkFormFieldsReadOnly,
  checkAlertMessage,
  getTableRow,
} from "@/e2e/utils/helpers";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

export class OperatorsPOM {
  readonly page: Page;

  readonly url: string = process.env.E2E_BASEURL + AppRoute.OPERATORS;

  readonly btnsApprove: Locator;

  readonly btnsDecline: Locator;

  readonly btnExpandAll: Locator;

  readonly btnViewDetail: Locator;

  readonly btnCancelModal: Locator;

  readonly btnConfirmModal: Locator;

  readonly formSectionOperator: Locator;

  readonly linkOperators: Locator;

  readonly modal: Locator;

  readonly msgInternal: Locator;

  readonly msgNewOperator: Locator;

  readonly table: Locator;

  readonly internalNote =
    /Once “Approved,” the user will have access to their operator dashboard with full admin permissions, and can grant access and designate permissions to other authorized users there./i;

  readonly newOperatorNote =
    /Note: This is a new operator. You must approve this operator before approving its admin./i;

  readonly alertNewOperatorMustBeApproved =
    /Operator must be approved before approving or declining users./i;

  readonly alertApprovedOperator =
    /You have approved the creation of the new operator./i;

  readonly alertDeclinedOperator =
    /You have declined the creation of the new operator./i;

  readonly alertApprovedPrimeAdmin =
    /You have approved the prime admin request./i;

  readonly alertDeclinedPrimeAdmin =
    /You have declined the prime admin request./i;

  constructor(page: Page) {
    this.page = page;
    this.btnsApprove = page.locator(
      `button[aria-label="${AriaLabel.APPLICATION_APPROVE}"]`
    );
    this.btnExpandAll = page.getByRole("button", {
      name: ActionClick.EXPAND_ALL,
    });
    this.btnsDecline = page.locator(
      `button[aria-label="${AriaLabel.APPLICATION_REJECT}"]`
    );
    this.btnViewDetail = page.getByRole("link", {
      name: ActionClick.VIEW_DETAILS,
    });
    this.formSectionOperator = page.getByRole("button", {
      name: FormSection.INFO_OPERATOR,
    });
    this.linkOperators = page.getByRole("link", {
      name: ActionClick.OPERATORS,
    });
    this.modal = page.locator(DataTestID.MODAL);
    this.btnCancelModal = this.modal.locator(
      `button[aria-label="${AriaLabel.MODAL_CANCEL}"]`
    );
    this.btnConfirmModal = this.modal.locator(
      `button[aria-label="${AriaLabel.MODAL_CONFIRM}"]`
    );
    this.msgInternal = page.getByText(this.internalNote);
    this.msgNewOperator = page.getByText(this.newOperatorNote);
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
      "Request\n ID",
      "First\n Name",
      "Last\n Name",
      "Email",
      "BCeID Business Name",
      "Operator Legal Name",
      "Status",
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
  }

  async viewIsCorrect(role: string) {
    switch (role) {
      case UserRole.INDUSTRY_USER_ADMIN:
        // later
        break;
      case UserRole.CAS_ADMIN:
        await expect(this.msgInternal).toBeVisible();
        break;
    }
  }

  async detailsHasExpectedUX(status: string) {
    // Locate row containing the status
    const row = await getTableRow(
      this.table,
      `[role="cell"][data-field="${TableDataField.STATUS}"]:has-text("${status}")`
    );

    // Click the `View Detail` for this status row
    await row.getByRole("link", { name: ActionClick.VIEW_DETAILS }).click();

    // Assert headers are visible
    await checkFormHeaders(this.page, [
      FormSection.INFO_OPERATOR,
      FormSection.INFO_USER,
    ]);

    // Assert that all form fields are visible, disabled and not editable
    await this.btnExpandAll.click();
    const allFormFields = await getAllFormInputs(this.page);
    await checkFormFieldsReadOnly(allFormFields);

    // Check buttons...
    switch (status) {
      case UserOperatorStatus.APPROVED:
      case UserOperatorStatus.DECLINED:
        // Make sure the review buttons are not visible
        await checkLocatorsVisibility(
          this.page,
          [this.btnsApprove, this.btnsDecline],
          false
        );
        break;
      case UserOperatorStatus.PENDING:
        // Get and check the buttons are visible (Multiple Approve and Decline buttons are visible)
        await checkLocatorsVisibility(this.page, [
          ...(await this.btnsApprove.all()),
          ...(await this.btnsDecline.all()),
        ]);
        expect(await this.btnsApprove.count()).toBe(2);
        expect(await this.btnsDecline.count()).toBe(2);
        break;
    }

    // Navigate back to the table
    await this.linkOperators.click();
    await this.table;
  }

  async detailsHasExpectedWorkflow(role: string, rowIndex: number) {
    // view details form for this row
    await this.btnViewDetail.nth(rowIndex).click();

    switch (role) {
      case UserRole.CAS_ADMIN:
        switch (rowIndex) {
          case 2:
            // Status Pending, Operator New
            // Workflow: Approve new operator and admin request
            // - new operator message is visible
            // - cannot approve admin access request
            // - can approve operator
            // - can approve admin access request

            // New operator note is visible
            await expect(this.msgNewOperator).toBeVisible();

            // cas_admin is not allowed to approve an admin access request if the Operator is new and hasn't been Approved yet
            await this.workflowReviewAction(
              this.btnsApprove.last(),
              this.btnConfirmModal,
              this.alertNewOperatorMustBeApproved
            );
            // cas_admin is able to Approve new operator
            await this.workflowReviewAction(
              this.btnsApprove.first(),
              this.btnConfirmModal,
              this.alertApprovedOperator
            );
            // cas_admin is able to Approve admin request
            await this.workflowReviewAction(
              this.btnsApprove.last(),
              this.btnConfirmModal,
              this.alertApprovedPrimeAdmin,
              1
            );
            break;
          case 3:
            // Status Pending, Operator New
            // Workflow: Reject new operator
            // - new operator message is visible (tested with row index 2)
            // - cannot reject admin access request
            // - can reject operator

            // cas_admin is not allowed to decline an admin access request if the Operator is new and hasn't been Approved yet
            await this.workflowReviewAction(
              this.btnsDecline.last(),
              this.btnConfirmModal,
              this.alertNewOperatorMustBeApproved
            );

            // cas_admin is able to Reject new operator
            await this.workflowReviewAction(
              this.btnsDecline.first(),
              this.btnConfirmModal,
              this.alertDeclinedOperator
            );

            // cas_admin can't see Approve/Decline buttons if the Operator has been Declined in the first form section
            await checkLocatorsVisibility(
              this.page,
              [this.btnsApprove, this.btnsDecline],
              false
            );
            break;
          case 5:
            // Status Pending, Operator Existing
            // Workflow: Approve existing operator admin request
            // - new operator message is NOT visible
            // - Operator info section header is collapsed
            // - only admin request approve button/reject button are visible
            // - can reject admin access request

            //  New operator note is NOT visible
            await expect(this.msgNewOperator).not.toBeVisible();

            // Operator information header is collapsed
            await expect(this.formSectionOperator).toHaveAttribute(
              "aria-expanded",
              "false"
            );

            // Make sure only admin approve/reject button are visible
            expect(await this.btnsApprove.count()).toBe(1);
            expect(await this.btnsDecline.count()).toBe(1);

            // cas_admin is able to Approve admin request
            await this.workflowReviewAction(
              this.btnsApprove.last(),
              this.btnConfirmModal,
              this.alertApprovedPrimeAdmin
            );
            break;
          case 15:
            // Status Pending, Operator Existing
            // Workflow: Reject existing operator admin request
            // - new operator message is NOT visible (tested with row index 5)
            // - Operator info section header is collapsed (tested with row index 5)
            // - only admin request approve button/reject button are visible (tested with row index 5)
            // - can reject admin access request

            // cas_admin is able to Reject admin request
            await this.workflowReviewAction(
              this.btnsDecline.last(),
              this.btnConfirmModal,
              this.alertDeclinedPrimeAdmin
            );

            break;
        }
    }

    // Navigate back to the table
    await this.linkOperators.click();
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

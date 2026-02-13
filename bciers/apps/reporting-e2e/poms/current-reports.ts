import { APIRequestContext, Locator, Page, expect } from "@playwright/test";

// -------------------------------------
// Enums / routes
// -------------------------------------
import {
  AppRoutes,
  FacilityIDs,
  OPERATION_NAMES,
  ReportIDs,
  ReportRoutes,
  SignOffCheckboxLabel,
} from "@/reporting-e2e/utils/enums";

// -------------------------------------
// Text / scenarios / UI copy
// -------------------------------------
import {
  DIALOG_TITLES,
  GRID_ACTION_TEXT,
  REASON_FOR_CHANGE_LABEL,
  SIGN_OFF_REPORT_SCENARIO,
  SIGN_OFF_SIGNATURE_LABEL,
  SIGN_OFF_SUBMIT_BUTTON_TEXT,
  SUBMISSION_SUCCESS_TEXT,
  TEST_SIGNATURE_NAME,
} from "@/reporting-e2e/utils/constants";

// -------------------------------------
// Shared helpers
// -------------------------------------
import { attachE2EStubEndpoint } from "@bciers/e2e/utils/e2eStubEndpoint";
import { waitForGridReady } from "@bciers/e2e/utils/helpers";

export class CurrentReportsPOM {
  readonly page: Page;

  readonly url: string =
    process.env.E2E_BASEURL + AppRoutes.GRID_REPORTING_CURRENT_REPORTS;

  constructor(page: Page) {
    this.page = page;
  }

  async route() {
    await this.page.goto(this.url);
    await waitForGridReady(this.page, { timeout: 30_000 });
  }

  // -----------------
  // locators
  // -----------------

  // ✅ "Submit Report" button (from Sign-off form)
  get submitButton(): Locator {
    return this.page.getByRole("button", {
      name: new RegExp(SIGN_OFF_SUBMIT_BUTTON_TEXT, "i"),
    });
  }

  // -----------------
  // URL builders
  // -----------------

  // 🔗 Sign-off URL for this version_id
  getSignOffUrl(reportId: string | number): string {
    return `${this.url}/${reportId}/${ReportRoutes.SIGN_OFF}`;
  }

  // 🔗 Submission success URL for this version_id
  getSubmissionUrl(reportId: string | number): string {
    return `${this.url}/${reportId}/${ReportRoutes.SUBMISSION}`;
  }

  // 🔗 Initial URL for this version_id report
  getReviewOperationInfoUrl(reportId: string | number): string {
    return `${this.url}/${reportId}/${ReportRoutes.REVIEW_OPERATION_INFORMATION}`;
  }

  // 🔗 Production Data page URL for this version_id report
  getProductionDataUrl(reportId: string | number, facilityId: string): string {
    return `${this.url}/${reportId}/${ReportRoutes.FACILITIES}/${facilityId}/${ReportRoutes.PRODUCTION_DATA}`;
  }

  // -----------------
  // navigation
  // -----------------

  // Navigate to the sign-off route for this report id
  async gotoSignOff(reportId: string | number) {
    await this.page.goto(this.getSignOffUrl(reportId));
  }

  // Navigate to the production data route for this report id and facility id
  async gotoProductionData(reportId: string | number, facilityId: string) {
    await this.page.goto(this.getProductionDataUrl(reportId, facilityId));
  }

  // // Navigate to the review changes page
  // async gotoReviewChanges(reportId: string | number) {
  //   // /reporting/reports/ (reportId) /review-changes
  // }

  // // Navigate to the attachments page
  // async gotoAttachments(reportId: string | number) {
  //   // /reporting/reports/ (reportId) /attachments
  // }

  // -----------------
  // form helpers
  // -----------------

  // 🔧 helper: tick a checkbox by enum label
  private async checkCheckboxByEnum(label: SignOffCheckboxLabel) {
    const checkbox = this.page.getByRole("checkbox", {
      name: new RegExp(label, "i"),
    });
    await expect(checkbox).toBeVisible();
    await expect(checkbox).toBeEnabled(); // small stability bump
    await checkbox.check();
    await expect(checkbox).toBeChecked();
  }

  /**
   * Fill all required sign-off fields so that the Submit button becomes enabled.
   * `isEioFlow` controls whether we check acknowledgement_of_errors vs
   * acknowledgement_of_information + acknowledgement_of_possible_costs.
   */
  async completeSignOffRequiredFields(isEioFlow = false) {
    // acknowledgement_of_review
    await this.checkCheckboxByEnum(SignOffCheckboxLabel.REVIEW);

    // acknowledgement_of_records
    await this.checkCheckboxByEnum(SignOffCheckboxLabel.RECORDS);

    // EIO vs non-EIO extra acknowledgements
    if (isEioFlow) {
      // acknowledgement_of_errors
      await this.checkCheckboxByEnum(SignOffCheckboxLabel.ERRORS);
    } else {
      // acknowledgement_of_information
      await this.checkCheckboxByEnum(SignOffCheckboxLabel.INFORMATION);
      // acknowledgement_of_possible_costs
      await this.checkCheckboxByEnum(SignOffCheckboxLabel.COSTS);
    }

    // Signature
    const signatureInput = this.page.getByLabel(
      new RegExp(SIGN_OFF_SIGNATURE_LABEL, "i"),
    );
    await expect(signatureInput).toBeVisible();
    await signatureInput.fill(TEST_SIGNATURE_NAME);
  }

  /**
   * Generic flow: submit any report by id.
   *
   * - Goes to sign-off for the specified report
   * - Completes all required fields
   * - Attaches stub for direct call to
   * - Clicks "Submit Report"
   * - Waits for /reporting/reports/:id/submission and success text
   */
  async submitReportById(
    reportId: string | number,
    isEioFlow = false,
    apiContext: APIRequestContext,
    isSupplementary: boolean = false,
  ) {
    await this.gotoSignOff(reportId);

    if (isSupplementary) {
      //  await this.completeExtraSignOffFieldsForSupplementaryReport();
    }
    await this.completeSignOffRequiredFields(isEioFlow);

    // Submit should now be enabled
    await expect(this.submitButton).toBeEnabled();

    // NOTE:
    // 🚫 We intentionally do NOT click Submit.
    // 🔌 Instead, we attach a stub API that posts to the e2e_integration_stub
    // 🗄️ perform DB actions
    // 🌐 mocks external code (api, etc)
    await attachE2EStubEndpoint(
      this.page,
      apiContext,
      () => ({
        scenario: SIGN_OFF_REPORT_SCENARIO,
        compliance_report_version_id: Number(reportId),
        payload: {
          signature: TEST_SIGNATURE_NAME,
          acknowledgement_of_records: true,
        },
      }),
      SIGN_OFF_REPORT_SCENARIO,
    );

    // After stub POST, navigate to signoff
    await this.page.goto(this.getSubmissionUrl(reportId));

    // Assert stats is Submitted
    await expect(
      this.page.getByText(new RegExp(SUBMISSION_SUCCESS_TEXT, "i")),
    ).toBeVisible();
  }

  // -----------------
  // submit report wrappers
  // -----------------

  async submitReportNoObligation(
    isEioFlow = false,
    apiContext?: APIRequestContext,
  ) {
    // NOTE: apiContext is required for attachE2EStubEndpoint; keep signature but assert at runtime
    if (!apiContext)
      throw new Error("submitReportNoObligation: apiContext is required");
    await this.submitReportById(ReportIDs.NO_OBLIGATION, isEioFlow, apiContext);
  }

  async submitReportEarnedCredits(
    isEioFlow = false,
    apiContext?: APIRequestContext,
  ) {
    if (!apiContext)
      throw new Error("submitReportEarnedCredits: apiContext is required");
    await this.submitReportById(
      ReportIDs.EARNED_CREDITS,
      isEioFlow,
      apiContext,
    );
  }

  async submitReportObligation(
    isEioFlow = false,
    apiContext?: APIRequestContext,
  ) {
    if (!apiContext)
      throw new Error("submitReportObligation: apiContext is required");
    await this.submitReportById(
      ReportIDs.OBLIGATION_NOT_MET,
      isEioFlow,
      apiContext,
    );
  }

  // -----------------
  // supplementary report
  // -----------------

  // Start a supplementary report with given reportId
  async startSupplementaryReportById(reportId: string | number) {
    // Map reportId (not in grid) to visible operation name
    const operationName =
      reportId === ReportIDs.OBLIGATION_NOT_MET
        ? OPERATION_NAMES.OBLIGATION_NOT_MET
        : reportId === ReportIDs.EARNED_CREDITS
          ? OPERATION_NAMES.EARNED_CREDITS
          : OPERATION_NAMES.NO_OBLIGATION;

    // grab row
    const row = this.page
      .getByRole("row")
      .filter({ hasText: operationName })
      .first();
    await expect(row).toBeVisible({ timeout: 30_000 });

    // open ⋮ menu
    const moreButton = row.locator('[data-field="more"] button');
    await expect(moreButton).toBeVisible();
    await moreButton.click();

    // menu item
    await this.page
      .getByRole("menuitem", {
        name: new RegExp(GRID_ACTION_TEXT.CREATE_SUPPLEMENTARY_REPORT, "i"),
      })
      .click();

    // confirmation dialog
    const dialogBox = this.page.getByRole("dialog", {
      name: new RegExp(DIALOG_TITLES.CONFIRMATION, "i"),
    });
    await expect(dialogBox).toBeVisible();

    // confirm + wait for navigation
    await Promise.all([
      this.page.waitForURL(
        (url) =>
          url.pathname.endsWith(
            `/${ReportRoutes.REVIEW_OPERATION_INFORMATION}`,
          ),
        { timeout: 30_000 },
      ),
      dialogBox.getByRole("button", { name: /confirm/i }).click(),
    ]);
  }

  async completeExtraSignOffFieldsForSupplementaryReport() {
    // TODO
  }
  // // fill all required fields in production data page
  // async fillProductionData(amount: number) {
  //   // fill all required fields in production data page
  // }

  // fill review changes box with whatever
  async fillReviewChangesBoxAndSave() {
    const reasonInput = this.page.getByLabel(
      new RegExp(REASON_FOR_CHANGE_LABEL, "i"),
    );
    await expect(reasonInput).toBeVisible();
    await reasonInput.fill(TEST_SIGNATURE_NAME);
    await expect(this.submitButton).toBeEnabled();
    await this.submitButton.click();
    // wait for next page?
  }

  // check attachaments checkboxes for supplementary reports
  // async checkAttachmentsChecksAndSave() {
  //   await this.checkCheckboxByEnum(SignOffCheckboxLabel.NEW_UPLOADS);
  //   await this.checkCheckboxByEnum(SignOffCheckboxLabel.PREVIOUS_RELEVANT);
  //   await expect(this.submitButton).toBeEnabled();
  //   await this.submitButton.click();
  //   // wait for next page?
  // }

  // -----------------
  // submit supplementary wrapper
  // -----------------

  async submitSupplementaryReportObligation(apiContext?: APIRequestContext) {
    await this.startSupplementaryReportById(ReportIDs.OBLIGATION_NOT_MET);

    await this.gotoProductionData(
      ReportIDs.OBLIGATION_NOT_MET,
      FacilityIDs.OBLIGATION_NOT_MET,
    );

    //   await this.fillProductionData(20000);

    //   await this.gotoReviewChanges(ReportIDs.OBLIGATION_NOT_MET);

    //   await this.fillReviewChangesBoxAndSave();

    //   await this.gotoAttachments(ReportIDs.OBLIGATION_NOT_MET);

    //   // await this.checkAttachmentsChecksAndSave();

    //   // NOTE: apiContext will be required once submit is re-enabled
    await this.submitReportById(
      ReportIDs.OBLIGATION_NOT_MET,
      false,
      apiContext,
      true,
    );
  }
}

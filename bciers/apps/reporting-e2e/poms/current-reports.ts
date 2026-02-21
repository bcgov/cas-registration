import { APIRequestContext, Locator, Page, expect } from "@playwright/test";
import {
  AppRoutes,
  AttachmentCheckboxLabel,
  FacilityIDs,
  OPERATION_NAMES,
  ReportIDs,
  ReportRoutes,
  SignOffCheckboxLabel,
} from "@/reporting-e2e/utils/enums";
import {
  DIALOG_BUTTON_TEXT,
  DIALOG_TITLES,
  FORM_BUTTON_TEXT,
  GRID_ACTION_TEXT,
  REPORTING_REPORTS_BASE_PATH,
  SIGN_OFF_REPORT_SCENARIO,
  SIGN_OFF_SIGNATURE_LABEL,
  SIGN_OFF_SUBMIT_BUTTON_TEXT,
  SUBMISSION_SUCCESS_TEXT,
  SIGN_OFF_SIGNATURE_NAME,
  REVIEW_CHANGES_DEFAULT_REASON,
  REVIEW_CHANGES_REASON_LABEL,
} from "@/reporting-e2e/utils/constants";

import { attachE2EStubEndpoint } from "@bciers/e2e/utils/e2eStubEndpoint";
import {
  checkCheckboxByLabel,
  clickButton,
  fillInputValueByLabel,
  fillInputValueByLocator,
  waitForGridReady,
} from "@bciers/e2e/utils/helpers";

export class CurrentReportsPOM {
  readonly page: Page;

  readonly url: string =
    process.env.E2E_BASEURL + AppRoutes.GRID_REPORTING_CURRENT_REPORTS;

  readonly saveAndContinueButton: Locator;

  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.saveAndContinueButton = this.page.getByRole("button", {
      name: new RegExp(FORM_BUTTON_TEXT.SAVE_AND_CONTINUE, "i"),
    });
    this.submitButton = this.page.getByRole("button", {
      name: new RegExp(SIGN_OFF_SUBMIT_BUTTON_TEXT, "i"),
    });
  }

  async route() {
    await this.page.goto(this.url);
    await waitForGridReady(this.page, { timeout: 30_000 });
  }

  // -----------------
  // URL builders
  // -----------------

  // Initial URL for this version_id report
  getReviewOperationInfoUrl(reportId: string | number): string {
    return `${this.url}/${reportId}/${ReportRoutes.REVIEW_OPERATION_INFORMATION}`;
  }

  // Production Data page URL for this version_id report
  getProductionDataUrl(reportId: string | number, facilityId: string): string {
    return `${this.url}/${reportId}/${ReportRoutes.FACILITIES}/${facilityId}/${ReportRoutes.PRODUCTION_DATA}`;
  }

  // Allocation of emissions page URL for this version_id report
  getAllocationEmissionsUrl(
    reportId: string | number,
    facilityId: string,
  ): string {
    return `${this.url}/${reportId}/${ReportRoutes.FACILITIES}/${facilityId}/${ReportRoutes.ALLOCATION_OF_EMISSIONS}`;
  }

  // Review Changes page URL for this version_id report
  getReviewChangesUrl(reportId: string | number): string {
    return `${this.url}/${reportId}/${ReportRoutes.REVIEW_CHANGES}`;
  }

  // Final Review page URL for this version_id report
  getFinalReviewsUrl(reportId: string | number): string {
    return `${this.url}/${reportId}/${ReportRoutes.FINAL_REVIEW}`;
  }

  // Attachments page url
  getAttachmentsUrl(reportId: string | number): string {
    return `${this.url}/${reportId}/${ReportRoutes.ATTACHMENTS}`;
  }

  // Sign-off URL for this version_id
  getSignOffUrl(reportId: string | number): string {
    return `${this.url}/${reportId}/${ReportRoutes.SIGN_OFF}`;
  }

  // Submission success URL for this version_id
  getSubmissionUrl(reportId: string | number): string {
    return `${this.url}/${reportId}/${ReportRoutes.SUBMISSION}`;
  }

  // -----------------
  // navigation
  // -----------------

  // Navigate to the production data route for this report id and facility id
  async gotoProductionData(reportId: string | number, facilityId: string) {
    await this.page.goto(this.getProductionDataUrl(reportId, facilityId));
  }

  // Navigate to the review changes page
  async gotoReviewChanges(reportId: string | number): Promise<void> {
    await this.page.goto(this.getReviewChangesUrl(reportId));
  }

  // Navigate to the attachments page
  async gotoAtachments(reportId: string | number): Promise<void> {
    await this.page.goto(this.getAttachmentsUrl(reportId));
  }

  // Navigate to the sign-off route for this report id
  async gotoSignOff(reportId: string | number) {
    await this.page.goto(this.getSignOffUrl(reportId));
  }

  // -----------------
  // helpers
  // -----------------
  private async clickSaveAndContinue(
    waitForUrl: RegExp,
    opts?: {
      inForm?: boolean;
    },
  ): Promise<void> {
    await clickButton(this.page, FORM_BUTTON_TEXT.SAVE_AND_CONTINUE, {
      inForm: opts?.inForm,
      waitForUrl,
    });
  }

  private extractReportVersionIdFromUrl(
    page: Page,
    route: ReportRoutes,
  ): number {
    const url = new URL(page.url());
    const parts = url.pathname.split("/").filter(Boolean);

    // .../reporting/reports/<id>/<route>
    const idIndex = parts.findIndex((p) => p === route) - 1;
    const id = Number(parts[idIndex]);

    if (!Number.isFinite(id)) {
      throw new Error(
        `Failed to extract report version id from URL: ${url.pathname}`,
      );
    }

    return id;
  }

  /**
   * Completes all sign-off fields required for the Submit button to become enabled,
   * based on the sign-off schema variant.
   *
   * Flow-specific rules:
   *
   * - EIO flow:
   *   - acknowledgement_of_certification
   *   - acknowledgement_of_records
   *   - acknowledgement_of_errors
   *
   * - Non-EIO flow:
   *   - acknowledgement_of_review
   *   - acknowledgement_of_records
   *   - acknowledgement_of_information
   *   - acknowledgement_of_possible_costs (only when NOT supplementary)
   *
   * Supplementary submissions:
   * - supplementary.acknowledgement_of_new_version
   * - supplementary.acknowledgement_of_corrections (only when regulated)
   *
   * @param isEioFlow - Whether the reporting flow is EIO (affects which acknowledgements appear)
   * @param isSupplementary - Whether this is a supplementary submission
   * @param isRegulated - Whether the operation is regulated (affects supplementary corrections)
   */
  async completeSignOffRequiredFields({
    isEioFlow = false,
    isSupplementary = false,
    isRegulated = false,
  }: {
    isEioFlow?: boolean;
    isSupplementary?: boolean;
    isRegulated?: boolean;
  } = {}) {
    // EIO vs non-EIO primary attestation
    if (isEioFlow) {
      await checkCheckboxByLabel(this.page, SignOffCheckboxLabel.CERTIFICATION);
    } else {
      await checkCheckboxByLabel(this.page, SignOffCheckboxLabel.REVIEW);
    }

    // Always present in both flows (per schema)
    await checkCheckboxByLabel(this.page, SignOffCheckboxLabel.RECORDS);

    // EIO vs non-EIO secondary acknowledgements
    if (isEioFlow) {
      await checkCheckboxByLabel(this.page, SignOffCheckboxLabel.ERRORS);
    } else {
      await checkCheckboxByLabel(this.page, SignOffCheckboxLabel.INFORMATION);

      // Only present when NOT supplementary and NOT EIO
      if (!isSupplementary) {
        await checkCheckboxByLabel(this.page, SignOffCheckboxLabel.COSTS);
      }
    }

    // Supplementary block (only if present)
    if (isSupplementary) {
      await checkCheckboxByLabel(this.page, SignOffCheckboxLabel.NEW_VERSION);

      if (isRegulated) {
        await checkCheckboxByLabel(this.page, SignOffCheckboxLabel.CORRECTIONS);
      }
    }

    // Signature
    const signatureInput = this.page.getByLabel(
      new RegExp(SIGN_OFF_SIGNATURE_LABEL, "i"),
    );
    await expect(signatureInput).toBeVisible();
    await signatureInput.fill(SIGN_OFF_SIGNATURE_NAME);
  }

  /**
   * Generic flow: submit any report by id.
   *
   * - Goes to sign-off for the specified report
   * - Completes all required fields
   * - Attaches stub for direct call to "Submit Report"
   * Why we stub submission:
   * - Avoids real external integrations during E2E (eLicensing/BCCR, etc.)
   *
   * @param apiContext Playwright API request context used by the E2E stub.
   * @param reportId Report version id
   * @param isEioFlow Whether to use the EIO sign-off acknowledgement set.
   * @param isSupplementary Whether to include supplementary sign-off acknowledgement set.
   * @param isRegulated Whether to include regulated sign-off acknowledgement set.
   */
  async submitReportById(
    apiContext: APIRequestContext,
    reportId: string | number,
    isEioFlow = false,
    isSupplementary = false,
    isRegulated = false,
  ) {
    const reportVersionId = Number(reportId);

    await this.gotoSignOff(reportVersionId);

    await this.completeSignOffRequiredFields({
      isEioFlow,
      isSupplementary,
      isRegulated,
    });

    // Submit should now be enabled
    await expect(this.submitButton).toBeEnabled();

    // Build acknowledgement payload to match schema variant
    const acknowledgements: Record<string, unknown> = {
      acknowledgement_of_records: true,
    };

    if (isEioFlow) {
      acknowledgements.acknowledgement_of_certification = true;
      acknowledgements.acknowledgement_of_errors = true;
    } else {
      acknowledgements.acknowledgement_of_review = true;
      acknowledgements.acknowledgement_of_information = true;

      // Only present when NOT supplementary and NOT EIO
      if (!isSupplementary) {
        acknowledgements.acknowledgement_of_possible_costs = true;
      }
    }

    if (isSupplementary) {
      acknowledgements.supplementary = {
        acknowledgement_of_new_version: true,
        ...(isRegulated && { acknowledgement_of_corrections: true }),
      };
    }

    const payload = {
      signature: SIGN_OFF_SIGNATURE_NAME,
      ...acknowledgements,
    };

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
        compliance_report_version_id: reportVersionId,
        payload: payload,
      }),
      SIGN_OFF_REPORT_SCENARIO,
    );

    // After stub POST, navigate to signoff
    await this.page.goto(this.getSubmissionUrl(reportVersionId));

    // Assert report has been Submitted
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

    await this.submitReportById(apiContext, ReportIDs.NO_OBLIGATION, isEioFlow);
  }

  async submitReportEarnedCredits(
    isEioFlow = false,
    apiContext?: APIRequestContext,
  ) {
    if (!apiContext)
      throw new Error("submitReportEarnedCredits: apiContext is required");

    await this.submitReportById(
      apiContext,
      ReportIDs.EARNED_CREDITS,
      isEioFlow,
    );
  }

  async submitReportObligation(
    isEioFlow = false,
    apiContext?: APIRequestContext,
  ) {
    if (!apiContext)
      throw new Error("submitReportObligation: apiContext is required");

    await this.submitReportById(
      apiContext,
      ReportIDs.OBLIGATION_NOT_MET,
      isEioFlow,
    );
  }

  // -----------------
  // supplementary report
  // -----------------

  async createSupplementaryReportById(
    reportId: string | number,
  ): Promise<number> {
    const operationName =
      reportId === ReportIDs.OBLIGATION_NOT_MET
        ? OPERATION_NAMES.OBLIGATION_NOT_MET
        : reportId === ReportIDs.EARNED_CREDITS
          ? OPERATION_NAMES.EARNED_CREDITS
          : OPERATION_NAMES.NO_OBLIGATION;

    // find row
    const row = this.page
      .getByRole("row")
      .filter({ hasText: operationName })
      .first();
    await expect(row).toBeVisible({ timeout: 30_000 });

    // open ⋮ menu
    const moreButton = row.locator('[data-field="more"] button');
    await expect(moreButton).toBeVisible();
    await moreButton.click();

    // click menu item
    await this.page
      .getByRole("menuitem", {
        name: new RegExp(GRID_ACTION_TEXT.CREATE_SUPPLEMENTARY_REPORT, "i"),
      })
      .click();

    // Confirmation dialog
    const dialogBox = this.page.getByRole("dialog", {
      name: new RegExp(DIALOG_TITLES.CONFIRMATION, "i"),
    });
    await expect(dialogBox).toBeVisible();

    // Confirm (server action runs server-to-server)
    await dialogBox
      .getByRole("button", {
        name: new RegExp(DIALOG_BUTTON_TEXT.CONFIRM, "i"),
      })
      .click();

    // Click Confirm and wait for the review-operation-information URL
    await clickButton(this.page, DIALOG_BUTTON_TEXT.CONFIRM, {
      waitForUrl: new RegExp(
        `${REPORTING_REPORTS_BASE_PATH}/\\d+/${ReportRoutes.REVIEW_OPERATION_INFORMATION}$`,
        "i",
      ),
    });
    // Extract the created supplementary report id from URL
    const newVersionId = this.extractReportVersionIdFromUrl(
      this.page,
      ReportRoutes.REVIEW_OPERATION_INFORMATION,
    );

    return newVersionId;
  }

  async fillProductionData(productIndex: number, annualProduction: number) {
    const inputId = `root_production_data_${productIndex}_annual_production`;
    const input = this.page.locator(`input#${inputId}[type="text"]`);

    await fillInputValueByLocator(input, annualProduction);
  }

  async fillReviewChanges(
    reason: string = REVIEW_CHANGES_DEFAULT_REASON,
  ): Promise<void> {
    await fillInputValueByLabel(
      this.page,
      new RegExp(REVIEW_CHANGES_REASON_LABEL, "i"),
      reason,
      { blur: "none" },
    );
  }

  async fillAttachments(): Promise<void> {
    await checkCheckboxByLabel(
      this.page,
      AttachmentCheckboxLabel.UPDATED_REQUIRED,
    );
    await checkCheckboxByLabel(
      this.page,
      AttachmentCheckboxLabel.STILL_RELEVANT,
    );
  }

  // -----------------
  // submit supplementary wrapper
  // -----------------

  /**
   * Completes a supplementary report flow that **decreases an obligation**
   * for an existing “Obligation Not Met” report.
   *
   * Flow overview:
   * - Creates a supplementary report from an OBLIGATION_NOT_MET base report
   * - Updates production data to reduce emissions
   * - Completes and Submits the supplementary report
   */
  async supplementaryReportObligationDecrease(apiContext?: APIRequestContext) {
    // Start supplementary report for OBLIGATION_NOT_MET
    const reportId = await this.createSupplementaryReportById(
      ReportIDs.OBLIGATION_NOT_MET,
    );

    // Fill Cement equivalent (product index 1) with annual production = 20,000, decreases emmissions
    await this.gotoProductionData(reportId, FacilityIDs.OBLIGATION_NOT_MET);
    await this.fillProductionData(1, 20_000);
    await this.clickSaveAndContinue(
      new RegExp(
        this.getAllocationEmissionsUrl(
          reportId,
          FacilityIDs.OBLIGATION_NOT_MET,
        ),
      ),
    );

    // Complete review changes
    await this.gotoReviewChanges(reportId);
    await this.fillReviewChanges();
    await this.clickSaveAndContinue(
      new RegExp(this.getFinalReviewsUrl(reportId)),
    );
    await expect(this.page).toHaveURL(
      new RegExp(`${this.getFinalReviewsUrl(reportId)}\\/?$`, "i"),
    );

    // Complete attachments
    await this.gotoAtachments(reportId);
    await this.fillAttachments();
    await this.clickSaveAndContinue(new RegExp(this.getSignOffUrl(reportId)));

    // Submit supplementary sign-off
    await this.submitReportById(
      apiContext,
      reportId,
      false, // isEioFlow
      true, // isSupplementary
      true, // isRegulated (obligation decrease implies regulated)
    );
  }
}

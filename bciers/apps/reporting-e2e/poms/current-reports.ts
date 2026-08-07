import { APIRequestContext, Locator, Page, expect } from "@playwright/test";
import {
  AppRoutes,
  AttachmentCheckboxLabel,
  FacilityIDs,
  REPORT_ID_TO_OPERATION_NAME,
  REPORT_STATUS,
  ReportIDs,
  ReportPageTitles,
  ReportRoutes,
  SignOffCheckboxLabel,
} from "@/reporting-e2e/utils/enums";
import {
  ACTION_BUTTON_TEXT,
  DIALOG_BUTTON_TEXT,
  DIALOG_TITLES,
  FORM_BUTTON_TEXT,
  GRID_ACTION_TEXT,
  REPORTING_REPORTS_BASE_PATH,
  SIGN_OFF_REPORT_SCENARIO,
  SIGN_OFF_SIGNATURE_LABEL,
  SIGN_OFF_SUBMIT_BUTTON_TEXT,
  SUBMISSION_SUCCESS_TEXT,
  SUBMISSION_SUCCESS_MESSAGE,
  SIGN_OFF_SIGNATURE_NAME,
  REVIEW_CHANGES_DEFAULT_REASON,
} from "@/reporting-e2e/utils/constants";

import { attachE2EStubEndpoint } from "@bciers/e2e/utils/e2eStubEndpoint";
import {
  assertFieldVisibility,
  checkCheckboxByLabel,
  clickButton,
  fillInputValueByLocator,
  waitForGridReady,
} from "@bciers/e2e/utils/helpers";
import {
  clickViewReportDetails,
  verifyFormTitle,
} from "@/reporting-e2e/utils/helpers";
import { ReviewChangesPOM } from "@/reporting-e2e/poms/review-changes";

/**
 * Matches the first page of any report version — where the app lands after starting a
 * report, resuming a draft, or creating a supplementary version.
 */
const REVIEW_OPERATION_INFO_URL_REGEX = new RegExp(
  String.raw`${REPORTING_REPORTS_BASE_PATH}/\d+/${ReportRoutes.REVIEW_OPERATION_INFORMATION}$`,
  "i",
);

export class CurrentReportsPOM {
  readonly page: Page;

  readonly url: string =
    process.env.E2E_BASEURL + AppRoutes.GRID_REPORTING_CURRENT_REPORTS;

  readonly subdirectory: string = "current-reports";

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
  getReportValidationUrl(reportId: string | number): string {
    return `${this.url}/${reportId}/${ReportRoutes.VALIDATION}`;
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
  // report grid actions
  // -----------------

  /**
   * Finds the operation row in the current reports grid and clicks "Start"
   * to create a new report for the current reporting year.
   *
   * Waits for navigation to the review-operation-information page and returns
   * the new report version ID extracted from the URL.
   */
  async startNewReportForOperation(operationName: string): Promise<number> {
    await waitForGridReady(this.page);

    const row = this.page
      .getByRole("row")
      .filter({ hasText: operationName })
      .first();
    await expect(row).toBeVisible();

    const startButton = row.getByRole("button", {
      name: new RegExp(ACTION_BUTTON_TEXT.START, "i"),
    });
    await expect(startButton).toBeVisible();
    await expect(startButton).toBeEnabled();

    await Promise.all([
      this.page.waitForURL(
        (u) => REVIEW_OPERATION_INFO_URL_REGEX.test(u.toString()),
        { waitUntil: "domcontentloaded" },
      ),
      startButton.click(),
      this.page.waitForLoadState("load"),
    ]);

    await verifyFormTitle(this.page, "Review Operation Information");

    return this.extractReportVersionIdFromUrl(
      this.page,
      ReportRoutes.REVIEW_OPERATION_INFORMATION,
    );
  }

  async continueReportForOperation(operationName: string): Promise<number> {
    await waitForGridReady(this.page);

    const row = this.page
      .getByRole("row")
      .filter({ hasText: operationName })
      .first();
    await expect(row).toBeVisible();

    await clickButton(
      this.page,
      new RegExp(`^${ACTION_BUTTON_TEXT.CONTINUE}$`, "i"),
      {
        root: row,
        waitForUrl: REVIEW_OPERATION_INFO_URL_REGEX,
      },
    );

    await verifyFormTitle(
      this.page,
      ReportPageTitles.REVIEW_OPERATION_INFORMATION,
    );

    return this.extractReportVersionIdFromUrl(
      this.page,
      ReportRoutes.REVIEW_OPERATION_INFORMATION,
    );
  }

  /**
   * Finds the operation row in the reports grid and clicks "View Details"
   * or "View Report" to view a submitted report.
   *
   * Waits for navigation to the submitted report details page.
   */
  async viewDetailsFromReportGrid(
    operationName: string,
    isExternalUser: boolean = true,
    reportingYear?: string,
  ): Promise<void> {
    await waitForGridReady(this.page);

    const row = this.page
      .getByRole("row")
      .filter({ hasText: operationName })
      .filter({ hasText: reportingYear ?? "" }) // if reportingYear is provided, filter by it as well
      .first();

    await expect(row).toBeVisible();
    await clickViewReportDetails(this.page, row, isExternalUser);
  }

  /***
   * Finds the operation row in the reports grid, clicks the "Report history" action,
   * and waits for navigation to the report history page.
   */
  async reportHistoryForOperation(
    operationName: string,
    reportingYear?: string,
  ): Promise<void> {
    await waitForGridReady(this.page);
    const row = this.page
      .getByRole("row")
      .filter({ hasText: operationName })
      .filter({ hasText: reportingYear ?? "" }) // if reportingYear is provided, filter by it as well
      .first();

    await expect(row).toBeVisible();

    const moreActionsButton = row.locator("#basic-button");
    await expect(moreActionsButton).toBeVisible();

    await moreActionsButton.click();
    const reportHistoryButton = this.page.getByRole("menuitem", {
      name: new RegExp(ACTION_BUTTON_TEXT.REPORT_HISTORY, "i"),
    });
    await expect(reportHistoryButton).toBeVisible();
    await expect(reportHistoryButton).toBeEnabled();

    await Promise.all([
      this.page.waitForURL(
        (u) =>
          new RegExp(
            String.raw`${AppRoutes.GRID_REPORT_HISTORY}/\d+$`,
            "i",
          ).test(u.toString()),
        { waitUntil: "domcontentloaded" },
      ),
      reportHistoryButton.click(),
    ]);
  }

  async verifySubmissionPage(isSupplementary: boolean = false): Promise<void> {
    await assertFieldVisibility(
      this.page,
      [
        SUBMISSION_SUCCESS_TEXT,
        isSupplementary
          ? SUBMISSION_SUCCESS_MESSAGE.SUPPLEMENTARY
          : SUBMISSION_SUCCESS_MESSAGE.INITIAL,
        "Submission time:",
        ACTION_BUTTON_TEXT.RETURN_TO_REPORT_TABLE,
      ],
      true,
    );

    await expect(
      this.page.getByRole("link", {
        name: ACTION_BUTTON_TEXT.VIEW_REPORT_HISTORY,
      }),
    ).toHaveCount(isSupplementary ? 1 : 0);
  }

  async verifyReportStatus(
    operationName: string,
    expectedStatus: REPORT_STATUS,
  ): Promise<void> {
    await waitForGridReady(this.page);
    const row = this.page
      .getByRole("row")
      .filter({ hasText: operationName })
      .first();
    await expect(row).toBeVisible();
    await expect(row.getByText(expectedStatus)).toBeVisible();

    const isSubmitted =
      expectedStatus === REPORT_STATUS.SUBMITTED ||
      expectedStatus === REPORT_STATUS.SUBMITTED_SUPPLEMENTARY;

    if (isSubmitted) {
      await expect(
        row.getByRole("button", { name: ACTION_BUTTON_TEXT.VIEW_DETAILS }),
      ).toBeVisible();
    }
  }

  async hasSubmittedReport(operationName: string): Promise<boolean> {
    await waitForGridReady(this.page);

    const row = this.page
      .getByRole("row")
      .filter({ hasText: operationName })
      .first();
    await expect(row).toBeVisible();

    return (await row.getByText(REPORT_STATUS.SUBMITTED).count()) > 0;
  }

  async verifyReportHeading(
    operationName: string,
    versionNumber: number,
  ): Promise<void> {
    await expect(
      this.page
        .getByRole("heading", { name: new RegExp(operationName, "i") })
        .first(),
    ).toBeVisible();
    await expect(
      this.page.getByText(`Version ${versionNumber}`, { exact: true }),
    ).toBeVisible();
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
  async gotoAttachments(reportId: string | number): Promise<void> {
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

  async verifySaveAndContinueDisabled(): Promise<void> {
    await expect(this.saveAndContinueButton).toBeVisible();
    await expect(this.saveAndContinueButton).toBeDisabled();
  }

  async verifySaveAndContinueEnabled(): Promise<void> {
    await expect(this.saveAndContinueButton).toBeVisible();
    await expect(this.saveAndContinueButton).toBeEnabled();
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
   * Searches for an operation name in the grid, making sure it appears
   * on the list of available rows if there are more than one page.
   */

  async searchByOperationName(operationName: string) {
    const operationSearchField = this.page
      .getByRole("columnheader", { name: "Operation search field" })
      .getByPlaceholder("Search");
    await operationSearchField.fill(operationName);

    await expect(operationSearchField).toHaveValue(operationName);

    await this.page.waitForURL(
      (u) =>
        u.searchParams.get("operation_name") === operationName &&
        new RegExp(`/${this.subdirectory}/?$`, "i").test(u.pathname),
      { timeout: 10_000 },
    );

    await waitForGridReady(this.page);

    const row = this.page
      .getByRole("row")
      .filter({ hasText: operationName })
      .first();

    await expect(row).toBeVisible({ timeout: 30_000 });
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

  async createSupplementaryReportForOperation(
    operationName: string,
  ): Promise<number> {
    await waitForGridReady(this.page);

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

    // Confirm (server action runs server-to-server), then the app redirects to the
    // new draft version's first page
    await Promise.all([
      this.page.waitForURL(
        (u) => REVIEW_OPERATION_INFO_URL_REGEX.test(u.toString()),
        { timeout: 30_000, waitUntil: "domcontentloaded" },
      ),
      dialogBox
        .getByRole("button", {
          name: new RegExp(DIALOG_BUTTON_TEXT.CONFIRM, "i"),
        })
        .click(),
    ]);

    // Extract the created supplementary report id from URL
    return this.extractReportVersionIdFromUrl(
      this.page,
      ReportRoutes.REVIEW_OPERATION_INFORMATION,
    );
  }

  /**
   * Wrapper around createSupplementaryReportForOperation for the report version IDs the compliance suite works with
   */
  async createSupplementaryReportById(
    reportId: string | number,
  ): Promise<number> {
    const operationName =
      REPORT_ID_TO_OPERATION_NAME[String(reportId) as ReportIDs];

    if (!operationName) {
      throw new Error(
        `createSupplementaryReportById: no operation name is mapped to report id "${reportId}". ` +
          `Add it to REPORT_ID_TO_OPERATION_NAME, or call createSupplementaryReportForOperation directly.`,
      );
    }

    return this.createSupplementaryReportForOperation(operationName);
  }

  async fillProductionData(productIndex: number, annualProduction: number) {
    const inputId = `root_production_data_${productIndex}_annual_production`;
    const input = this.page.locator(`input#${inputId}[type="text"]`);

    await fillInputValueByLocator(input, annualProduction);
  }

  async fillReviewChanges(
    reason: string = REVIEW_CHANGES_DEFAULT_REASON,
  ): Promise<void> {
    await new ReviewChangesPOM(this.page).fillReason(reason);
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

  async verifySupplementarySignOffFields(
    isRegulated: boolean = true,
  ): Promise<void> {
    await expect(
      this.page.getByRole("checkbox", {
        name: new RegExp(SignOffCheckboxLabel.NEW_VERSION, "i"),
      }),
    ).toBeVisible();

    await expect(
      this.page.getByRole("checkbox", {
        name: new RegExp(SignOffCheckboxLabel.CORRECTIONS, "i"),
      }),
    ).toHaveCount(isRegulated ? 1 : 0);

    await expect(
      this.page.getByRole("checkbox", {
        name: new RegExp(SignOffCheckboxLabel.COSTS, "i"),
      }),
    ).toHaveCount(0);
  }

  // -----------------
  // submit supplementary wrapper
  // -----------------

  /**
   * Completes a supplementary report flow that **decreases an obligation**
   * for an existing “Obligation Not Met” report.
   *
   * “Amount of decrease” in this flow is controlled by the production input(s)
   *
   * @param apiContext Playwright API request context (required for stub submission)
   * @param options Controls how much the obligation decreases (via production values)
   */
  async supplementaryReportObligationDecrease(
    apiContext: APIRequestContext,
    {
      annualProduction,
      productIndex,
      reviewChangesReason,
      facilityId = FacilityIDs.OBLIGATION_NOT_MET,
    }: {
      annualProduction: number;
      productIndex: number;
      reviewChangesReason?: string;
      facilityId?: FacilityIDs;
    },
  ): Promise<void> {
    const reportId = await this.createSupplementaryReportById(
      ReportIDs.OBLIGATION_NOT_MET,
    );

    await this.gotoProductionData(reportId, facilityId);
    await this.fillProductionData(productIndex, annualProduction);

    await this.clickSaveAndContinue(
      new RegExp(this.getAllocationEmissionsUrl(reportId, facilityId)),
    );

    await this.gotoReviewChanges(reportId);
    await this.fillReviewChanges(reviewChangesReason);

    await this.clickSaveAndContinue(
      new RegExp(this.getReportValidationUrl(reportId)),
    );
    await expect(this.page).toHaveURL(
      new RegExp(`${this.getReportValidationUrl(reportId)}\\/?$`, "i"),
    );

    await this.gotoAttachments(reportId);
    await this.fillAttachments();
    await this.clickSaveAndContinue(new RegExp(this.getSignOffUrl(reportId)));

    await this.submitReportById(apiContext, reportId, false, true, true);
  }
}

import { Locator, Page, expect } from "@playwright/test";
import {
  AppRoutes,
  ReportIDs,
  ReportRoutes,
  SignOffCheckboxLabel,
} from "@/reporting-e2e/utils/enums";
import {
  SIGN_OFF_SUBMIT_BUTTON_TEXT,
  SIGN_OFF_SIGNATURE_LABEL,
  TEST_SIGNATURE_NAME,
  SUBMISSION_SUCCESS_TEXT,
} from "@/reporting-e2e/utils/constants";

export class GridReportingCurrentReportsPOM {
  readonly page: Page;

  readonly url: string =
    process.env.E2E_BASEURL + AppRoutes.GRID_REPORTING_CURRENT_REPORTS;

  constructor(page: Page) {
    this.page = page;
  }

  // 🔧 helper: tick a checkbox by enum label
  private async checkCheckboxByEnum(label: SignOffCheckboxLabel) {
    const checkbox = this.page.getByRole("checkbox", {
      name: new RegExp(label, "i"),
    });
    await expect(checkbox).toBeVisible();
    await checkbox.check();
  }

  // ✅ "Submit Report" button (from Sign-off form)
  get submitButton(): Locator {
    return this.page.getByRole("button", {
      name: new RegExp(SIGN_OFF_SUBMIT_BUTTON_TEXT, "i"),
    });
  }

  // 🔗 Sign-off URL for this version_id
  getSignOffUrl(reportId: string | number): string {
    return `${this.url}/${reportId}/${ReportRoutes.SIGN_OFF}`;
  }

  // 🔗 Submission success URL for this version_id
  getSubmissionUrl(reportId: string | number): string {
    return `${this.url}/${reportId}/${ReportRoutes.SUBMISSION}`;
  }

  // Navigate to the sign-off route for this report id
  async gotoSignOff(reportId: string | number) {
    await this.page.goto(this.getSignOffUrl(reportId));
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

    // Submit should now be enabled
    await expect(this.submitButton).toBeEnabled();
  }

  /**
   * Generic flow: submit any report by id.
   *
   * - Goes to sign-off for the specified report
   * - Completes all required fields
   * - Clicks "Submit Report"
   * - Waits for /reporting/reports/:id/submission and success text
   */
  async submitReportById(reportId: string | number, isEioFlow = false) {
    await this.gotoSignOff(reportId);

    await this.completeSignOffRequiredFields(isEioFlow);

    // Wait for navigation to the submission success page
    await Promise.all([
      this.page.waitForURL(
        new RegExp(
          `/reporting/reports/${reportId}/${ReportRoutes.SUBMISSION}$`,
        ),
      ),
      this.submitButton.click(),
    ]);

    // Assert submission success UI is visible
    await expect(
      this.page.getByText(new RegExp(SUBMISSION_SUCCESS_TEXT, "i")),
    ).toBeVisible();
  }

  // 🧩 Convenience wrappers for specific seeded report IDs

  async submitReportNoObligation(isEioFlow = false) {
    await this.submitReportById(ReportIDs.NO_OBLIGATION, isEioFlow);
  }

  async submitReportEarnedCredits(isEioFlow = false) {
    await this.submitReportById(ReportIDs.EARNED_CREDITS, isEioFlow);
  }

  async submitReportObligation(isEioFlow = false) {
    await this.submitReportById(ReportIDs.OBLIGATION_NOT_MET, isEioFlow);
  }
}

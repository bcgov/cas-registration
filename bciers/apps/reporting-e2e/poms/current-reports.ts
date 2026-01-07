import { APIRequestContext, Locator, Page, expect } from "@playwright/test";
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
  SIGN_OFF_REPORT_ROUTE_PATTERN,
  SIGN_OFF_REPORT_VERSION_ID_REGEX,
  SIGN_OFF_REPORT_SCENARIO,
  SUBMISSION_SUCCESS_TEXT,
  SIGN_OFF_SUBMIT_URL_PATTERN,
} from "@/reporting-e2e/utils/constants";

import { clickButton } from "@bciers/e2e/utils/helpers";

import { attachE2EStubEndpoint } from "@bciers/e2e/utils/e2eStubEndpoint";

export class CurrentReportsPOM {
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
    await expect(checkbox).toBeChecked();
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
   * Attach a route so to intercept the action handler submit call
   * and delegate to the Django /e2e-integration-stub endpoint.
   */
  async attachSubmitReportStub(api: APIRequestContext): Promise<void> {
    await attachE2EStubEndpoint(
      this.page,
      api,
      SIGN_OFF_REPORT_ROUTE_PATTERN,
      ({ url, body }) => {
        const match = url.match(SIGN_OFF_REPORT_VERSION_ID_REGEX);
        const crvId = match?.[1];
        if (!crvId) throw new Error(`Could not extract crvId from URL: ${url}`);

        return {
          scenario: SIGN_OFF_REPORT_SCENARIO,
          compliance_report_version_id: Number(crvId),
          payload: body,
        };
      },
      async ({ route, stubResponse, json }) => {
        await route.fulfill({
          status: stubResponse.status(),
          contentType: "application/json",
          body: JSON.stringify(json),
        });
      },
      SIGN_OFF_REPORT_SCENARIO,
    );
  }

  /**
   * Generic flow: submit any report by id.
   *
   * - Goes to sign-off for the specified report
   * - Completes all required fields
   * - Optionally attaches stub (if apiContext provided) AFTER form is filled
   * - Clicks "Submit Report"
   * - Waits for /reporting/reports/:id/submission and success text
   */
  async submitReportById(
    reportId: string | number,
    isEioFlow = false,
    apiContext?: APIRequestContext,
  ) {
    await this.gotoSignOff(reportId);

    await this.completeSignOffRequiredFields(isEioFlow);

    // 🔌 Attach stub AFTER form is filled to ensure payload is populated
    if (apiContext) {
      await this.page.waitForTimeout(200);
      await this.attachSubmitReportStub(apiContext);
    }

    // Click submit and wait for navigation
    await clickButton(this.page, SIGN_OFF_SUBMIT_BUTTON_TEXT, {
      waitForUrl: SIGN_OFF_SUBMIT_URL_PATTERN,
    });

    // Assert submission success UI is visible
    await expect(
      this.page.getByText(new RegExp(SUBMISSION_SUCCESS_TEXT, "i")),
    ).toBeVisible();
  }

  // 🧩 Convenience wrappers for specific seeded report IDs

  async submitReportNoObligation(
    isEioFlow = false,
    apiContext?: APIRequestContext,
  ) {
    await this.submitReportById(ReportIDs.NO_OBLIGATION, isEioFlow, apiContext);
  }

  async submitReportEarnedCredits(
    isEioFlow = false,
    apiContext?: APIRequestContext,
  ) {
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
    await this.submitReportById(
      ReportIDs.OBLIGATION_NOT_MET,
      isEioFlow,
      apiContext,
    );
  }
}

import { APIRequestContext, Locator, Page, expect } from "@playwright/test";
import { attachE2EStubEndpoint } from "@bciers/e2e/utils/e2eStubEndpoint";
import { PenaltyStatus } from "@/compliance-e2e/utils/enums";

/**
 * Options sent to the e2e stub scenarios that prime penalty state.
 */
export interface AutomaticOverduePenaltyPayload {
  /** Days past the invoice due date */
  days_overdue?: number;
  penalty_status?: PenaltyStatus;
  /** Whether the automatic overdue penalty has reached its maximum and stopped accruing */
  cap_reached?: boolean;
  /** Penalty record amount, seeded when the penalty is capped or not paid */
  penalty_amount?: string;
  /** Invoice number for the seeded penalty record */
  penalty_invoice_number?: string;
}

export class PenaltyCalculatorPOM {
  readonly page: Page;

  // Field Locators
  readonly finalAccrualDateInput: Locator;
  readonly accrualDataCell: Locator;
  readonly ggeaparOption: Locator;
  readonly selectedPenaltyTypeInput: Locator;
  readonly ggeaparNotApplicableAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.finalAccrualDateInput = page.locator(
      "#root_final_day_of_penalty_accrual",
    );
    this.ggeaparOption = page.getByText("GGEAPAR", { exact: true });
    this.selectedPenaltyTypeInput = page.locator(
      'input[name="root_requested_penalty_type"]:checked',
    );
    this.ggeaparNotApplicableAlert = page.getByText(
      /GGEAPAR interest only applies to obligations for supplementary compliance reports/i,
    );
    this.accrualDataCell = page
      .locator('[role="gridcell"], [role="cell"], table tbody tr td')
      .first();
  }

  // -----------------
  // Actions
  // -----------------

  /**
   * Primes an overdue obligation with an accruing automatic overdue penalty.
   * Uses the original (non-supplementary) report, so GGEAPAR interest does not apply.
   */
  async setupAccruingPenaltyState(
    apiContext: APIRequestContext,
    complianceReportVersionId: number | string,
    options?: AutomaticOverduePenaltyPayload,
  ) {
    await this.setupPenaltyScenario(
      apiContext,
      complianceReportVersionId,
      "automatic_overdue_penalty",
      "Automatic Overdue Penalty Setup",
      options,
    );
  }

  /**
   * Primes a supplementary report that was submitted after the compliance
   * deadline, so GGEAPAR interest applies and accrues.
   */
  async setupSupplementaryLateSubmissionState(
    apiContext: APIRequestContext,
    complianceReportVersionId: number | string,
    options?: AutomaticOverduePenaltyPayload,
  ) {
    await this.setupPenaltyScenario(
      apiContext,
      complianceReportVersionId,
      "supplementary_late_submission",
      "Supplementary Late Submission Setup",
      options,
    );
  }

  /**
   * Calls the Django e2e stub directly to set up server-side state.
   * Both scenarios share the same payload shape.
   */
  private async setupPenaltyScenario(
    apiContext: APIRequestContext,
    complianceReportVersionId: number | string,
    scenario: string,
    label: string,
    options?: AutomaticOverduePenaltyPayload,
  ) {
    // The stub call reads the user guid from the page, so it needs a loaded page
    if (this.page.url() === "about:blank") {
      await this.page.goto("/");
    }

    const payload: AutomaticOverduePenaltyPayload = {
      days_overdue: options?.days_overdue ?? 45,
      penalty_status: options?.penalty_status ?? PenaltyStatus.ACCRUING,
      cap_reached: options?.cap_reached ?? false,
      ...(options?.penalty_amount && {
        penalty_amount: options.penalty_amount,
      }),
      ...(options?.penalty_invoice_number && {
        penalty_invoice_number: options.penalty_invoice_number,
      }),
    };

    await attachE2EStubEndpoint(
      this.page,
      apiContext,
      () => ({
        scenario,
        compliance_report_version_id: Number(complianceReportVersionId),
        payload,
      }),
      label,
      { directCall: true },
    );
  }

  /**
   * Enters the final accrual date and waits for the recalculated grid rows.
   * The date must be today or later, as the picker's minDate is today.
   *
   * @param date ISO date, YYYY-MM-DD
   */
  async setFinalAccrualDate(date: string = "2026-12-15"): Promise<void> {
    const input = this.finalAccrualDateInput;
    await expect(input).toBeVisible();

    await input.click();
    await input.press("ControlOrMeta+a");
    await input.press("Backspace");
    await this.page.keyboard.type(date.replaceAll("-", ""), { delay: 50 });
    await input.blur();

    await expect(input).toHaveValue(date, { timeout: 5_000 });
    await expect(this.accrualDataCell).toBeVisible({ timeout: 15_000 });
  }

  /**
   * Switches the penalty type to GGEAPAR and confirms it took effect.
   * GGEAPAR is stored as the "Late Submission" penalty type.
   */
  async selectGgeaparPenaltyType(): Promise<void> {
    await expect(this.ggeaparOption).toBeVisible();
    await this.ggeaparOption.click();
    await expect(this.selectedPenaltyTypeInput).toHaveValue("Late Submission");
  }

  async assertGgeaparNotApplicable(): Promise<void> {
    await expect(this.ggeaparNotApplicableAlert).toBeVisible({
      timeout: 15_000,
    });
  }

  async assertGgeaparNotApplicableHidden(): Promise<void> {
    await expect(this.ggeaparNotApplicableAlert).toBeHidden();
  }

  async assertUrlCorrect(complianceReportVersionId: number | string) {
    await expect(this.page).toHaveURL(
      new RegExp(
        `/compliance-summaries/${complianceReportVersionId}/penalty-calculator`,
      ),
    );
  }

  async assertPenaltyGridLoaded() {
    await expect(this.accrualDataCell).toBeVisible({ timeout: 15_000 });
  }
}

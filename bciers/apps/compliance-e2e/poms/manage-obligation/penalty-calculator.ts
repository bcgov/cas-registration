import { APIRequestContext, Locator, Page, expect } from "@playwright/test";
import { attachE2EStubEndpoint } from "@bciers/e2e/utils/e2eStubEndpoint";
import { fillDateFieldByLabel } from "@bciers/e2e/utils/helpers";
import { DEFAULT_DAYS_OVERDUE } from "@/compliance-e2e/utils/constants";

/**
 * Options sent to the make_obligation_overdue e2e stub scenario.
 */
export interface MakeObligationOverduePayload {
  /** Report version the obligation was created from */
  report_version_id: number;
  /** Days since the compliance deadline */
  days_overdue?: number;
  /** Days after the compliance deadline the obligation was created, which makes a supplementary report late */
  days_after_deadline?: number;
}

export interface MakeObligationOverdueResult {
  compliance_report_version_id: number;
  is_supplementary: boolean;
  compliance_deadline: string;
  /** The deadline before it was moved, to restore once the test is done */
  original_compliance_deadline: string;
  invoice_due_date: string;
}

export class PenaltyCalculatorPOM {
  readonly page: Page;

  // Field Locators
  readonly finalAccrualDateInput: Locator;
  readonly finalAccrualDateField: Locator;
  readonly accrualDataCell: Locator;
  readonly ggeaparOption: Locator;
  readonly selectedPenaltyTypeInput: Locator;
  readonly ggeaparNotApplicableAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.finalAccrualDateInput = page.locator(
      "#root_final_day_of_penalty_accrual",
    );
    // The visible date sections sit in this group, over the hidden input
    this.finalAccrualDateField = this.finalAccrualDateInput.locator(
      "xpath=ancestor::*[@role='group'][1]",
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

  // The stub call reads the user guid from the page, so it needs a loaded page
  private async ensurePageLoaded() {
    if (this.page.url() === "about:blank") {
      await this.page.goto("/");
    }
  }

  /**
   * Moves the compliance deadline and obligation dates of a submitted report into the past via the
   * Django e2e stub, so penalties and interest accrue. Returns the compliance report version it changed.
   */
  async makeOverdue(
    apiContext: APIRequestContext,
    options: MakeObligationOverduePayload,
  ): Promise<MakeObligationOverdueResult> {
    await this.ensurePageLoaded();

    const payload: MakeObligationOverduePayload = {
      ...options,
      days_overdue: options.days_overdue ?? DEFAULT_DAYS_OVERDUE,
    };

    return attachE2EStubEndpoint<MakeObligationOverdueResult>(
      this.page,
      apiContext,
      () => ({ scenario: "make_obligation_overdue", payload }),
      "Make Obligation Overdue",
      { directCall: true },
    );
  }

  /**
   * Puts back the compliance deadline that makeOverdue moved. The deadline belongs to the compliance period,
   * which every report of that year shares, so leaving it in the past would affect other specs.
   */
  async restoreComplianceDeadline(
    apiContext: APIRequestContext,
    reportVersionId: number,
    originalComplianceDeadline: string,
  ): Promise<void> {
    await this.ensurePageLoaded();

    await attachE2EStubEndpoint(
      this.page,
      apiContext,
      () => ({
        scenario: "make_obligation_overdue",
        payload: {
          report_version_id: reportVersionId,
          restore_compliance_deadline: originalComplianceDeadline,
        },
      }),
      "Make Obligation Overdue Restore",
      { directCall: true },
    );
  }

  /**
   * Enters the final accrual date and waits for the recalculated grid rows.
   * The date must be today or later, as the picker's minDate is today.
   *
   * @param date ISO date, YYYY-MM-DD
   */
  async setFinalAccrualDate(date: string): Promise<void> {
    await fillDateFieldByLabel(
      this.page,
      /select final day of penalty accrual/i,
      date,
    );
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

  /**
   * Hides the final accrual date input from Happo. It is relative to today, so it would otherwise
   * produce a diff every day.
   */
  async hideDateInputFromScreenshot(): Promise<void> {
    await this.finalAccrualDateField.evaluate((el) => {
      el.dataset.happoHide = "";
    });
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

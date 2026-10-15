import { APIRequestContext, Locator, Page, expect } from "@playwright/test";
import { attachE2EStubEndpoint } from "@bciers/e2e/utils/e2eStubEndpoint";
import {
  COMPLIANCE_SUMMARIES_BASE_PATH,
  DEFAULT_DAYS_OVERDUE,
} from "@/compliance-e2e/utils/constants";

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
  readonly accrualDataCell: Locator;
  readonly ggeaparOption: Locator;
  readonly selectedPenaltyTypeInput: Locator;
  readonly ggeaparNotApplicableAlert: Locator;
  readonly notFoundHeading: Locator;

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
    this.notFoundHeading = page.getByRole("heading", { name: "Not found" });
    this.accrualDataCell = page
      .locator('[role="gridcell"], [role="cell"], table tbody tr td')
      .first();
  }

  // -----------------
  // Actions
  // -----------------

  /**
   * Navigates directly to the penalty calculator for a compliance report version.
   */
  async route(complianceReportVersionId: number | string) {
    await this.page.goto(
      `${COMPLIANCE_SUMMARIES_BASE_PATH}/${complianceReportVersionId}/penalty-calculator`,
      { waitUntil: "domcontentloaded" },
    );
  }

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

  /**
   * Hides the final accrual date input and the grid's date column from Happo.
   * Both are relative to today, so they would otherwise produce a diff every day.
   */
  async hideDatesFromScreenshot(): Promise<void> {
    await this.finalAccrualDateInput.evaluate((el) => {
      el.dataset.happoHide = "";
    });
    await this.page
      .locator('[role="gridcell"][data-field="date"]')
      .evaluateAll((cells) => {
        for (const cell of cells) {
          cell.dataset.happoHide = "";
        }
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

  async assertNotFound() {
    await expect(this.notFoundHeading).toBeVisible({ timeout: 15_000 });
    await expect(this.finalAccrualDateInput).toHaveCount(0);
  }
}

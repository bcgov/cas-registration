import { APIRequestContext, Locator, Page, expect } from "@playwright/test";
import { attachE2EStubEndpoint } from "@bciers/e2e/utils/e2eStubEndpoint";
import { PenaltyStatus } from "@/compliance-e2e/utils/enums";

export interface AutomaticOverduePenaltyPayload {
  days_overdue?: number;
  penalty_status?: PenaltyStatus;
  cap_reached?: boolean;
  penalty_amount?: string;
  penalty_invoice_number?: string;
}

export class PenaltyCalculatorPOM {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // -----------------
  // Locators
  // -----------------

  /**
   * Scopes strictly to section 2 to locate the final accrual date input.
   */
  get finalAccrualDateInput(): Locator {
    return this.page
      .locator("div, section, fieldset")
      .filter({ hasText: /select final day of penalty accrual/i })
      .locator("input")
      .first();
  }

  /**
   * Locates any rendered data cell in the Accrual Data table
   * (supporting gridcell, cell, and native td).
   */
  get accrualDataCell(): Locator {
    return this.page
      .locator('[role="gridcell"], [role="cell"], table tbody tr td')
      .first();
  }

  // -----------------
  // Actions
  // -----------------

  async setupAccruingPenaltyState(
    apiContext: APIRequestContext,
    complianceReportVersionId: number | string,
    options?: AutomaticOverduePenaltyPayload,
  ) {
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
        scenario: "automatic_overdue_penalty",
        compliance_report_version_id: Number(complianceReportVersionId),
        payload,
      }),
      "Automatic Overdue Penalty Setup",
      { directCall: true },
    );
  }

  /**
   * Updates the accrual date picker and waits for the calculation to render table rows.
   */
  async setFinalAccrualDate(date: string = "2026-12-15"): Promise<void> {
    const input = this.finalAccrualDateInput;
    await expect(input).toBeVisible();

    // 1. Focus and clear existing value
    await input.click();
    await input.press("ControlOrMeta+a");
    await input.press("Backspace");

    // 2. Dispatch change through React's native prototype setter with bubbling events
    await input.evaluate((el: HTMLInputElement, val: string) => {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      )?.set;
      nativeSetter?.call(el, val);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }, date);

    // 3. Fallback sequential typing if the native setter was masked by a date picker widget
    const currentValue = await input.inputValue();
    if (currentValue !== date) {
      await input.fill(date);
    }

    await input.press("Enter");
    await input.dispatchEvent("blur");

    // 4. Verify input retained the target date
    await expect(input).toHaveValue(date, { timeout: 5_000 });

    // 5. Wait for the calculation to run and populate at least one data cell
    await expect(this.accrualDataCell).toBeVisible({ timeout: 15_000 });
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

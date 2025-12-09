import { expect, Page } from "@playwright/test";
import {
  ANALYST_CONTINUE_URL_PATTERN,
  DIRECTOR_CONTINUE_URL_PATTERN,
  CONTINUE_BUTTON_TEXT,
} from "@/compliance-e2e/utils/constants";

export class InternalReviewComplianceEarnedCreditsPOM {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Shared helper: clicks the "Continue" button and waits for the given URL.
   */
  private async submitAndWaitFor(nextUrlPattern: RegExp): Promise<void> {
    const labelRegex = new RegExp(CONTINUE_BUTTON_TEXT, "i");
    const submitButton = this.page
      .locator("form")
      .getByRole("button", { name: labelRegex });

    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();

    await submitButton.click();

    await expect(this.page).toHaveURL(nextUrlPattern);
  }

  /**
   * Analyst flow: submits the internal review
   */
  async submitAnalystReviewRequestIssuance(): Promise<void> {
    await this.submitAndWaitFor(ANALYST_CONTINUE_URL_PATTERN);
  }

  /**
   * Director flow: submits the director review
   */
  async submitDirectorReviewIssuance(): Promise<void> {
    await this.submitAndWaitFor(DIRECTOR_CONTINUE_URL_PATTERN);
  }
}

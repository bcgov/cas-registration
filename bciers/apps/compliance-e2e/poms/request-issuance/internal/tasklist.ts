import { expect, Page } from "@playwright/test";
import {
  REVIEW_REQUEST_ISSUANCE_CREDITS_URL_PATTERN,
  REVIEW_BY_DIRECTOR_URL_PATTERN,
} from "@/compliance-e2e/utils/constants";
import { ComplianceTaskTitles } from "@/compliance-e2e/utils/enums";

export class InternalRequestIssuanceTaskListPOM {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Generic helper to click a task-list button by label
   * and wait for the expected route.
   */
  private async clickTask(label: string, expectedUrlPattern: RegExp) {
    const labelRegex = new RegExp(label, "i");

    const button = this.page.getByRole("button", { name: labelRegex });

    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();

    await Promise.all([
      this.page.waitForURL(expectedUrlPattern),
      button.click(),
    ]);
  }

  async clickReviewRequestIssuance() {
    await this.clickTask(
      ComplianceTaskTitles.REVIEW_REQUEST_ISSUANCE,
      REVIEW_REQUEST_ISSUANCE_CREDITS_URL_PATTERN,
    );
  }

  async clickReviewByDirector() {
    await this.clickTask(
      ComplianceTaskTitles.REVIEW_BY_DIRECTOR,
      REVIEW_BY_DIRECTOR_URL_PATTERN,
    );
  }
}

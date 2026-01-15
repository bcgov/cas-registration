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
   *
   * Uses expect.toPass to retry the whole "locate + click + navigate" block.
   */
  private async clickTask(
    label: string,
    expectedUrlPattern: RegExp,
    options?: { timeout?: number },
  ) {
    const timeout = options?.timeout ?? 30_000;
    const labelRegex = new RegExp(label, "i");
    await expect(async () => {
      const button = this.page.getByRole("button", { name: labelRegex });
      const count = await button.count().catch(() => 0);

      expect(count).toBeGreaterThan(0);
      await expect(button).toBeVisible();
      await expect(button).toBeEnabled();

      await Promise.all([
        this.page.waitForURL(expectedUrlPattern, { timeout }),
        button.click(),
      ]);

      await expect(this.page).toHaveURL(expectedUrlPattern);
    }).toPass({ timeout });
  }

  async clickReviewRequestIssuance(options?: { timeout?: number }) {
    await this.clickTask(
      ComplianceTaskTitles.REVIEW_REQUEST_ISSUANCE,
      REVIEW_REQUEST_ISSUANCE_CREDITS_URL_PATTERN,
      options,
    );
  }

  async clickReviewByDirector(options?: { timeout?: number }) {
    await this.clickTask(
      ComplianceTaskTitles.REVIEW_BY_DIRECTOR,
      REVIEW_BY_DIRECTOR_URL_PATTERN,
      options,
    );
  }
}

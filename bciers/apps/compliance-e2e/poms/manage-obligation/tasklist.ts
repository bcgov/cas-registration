import { Page, expect } from "@playwright/test";
import { ComplianceTaskTitles } from "@/compliance-e2e/utils/enums";
import { DOWNLOAD_PAYMENT_INSTRUCTIONS_URL_PATTERN } from "@/compliance-e2e/utils/constants";

export class ManageObligationTaskListPOM {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Clicks the "Download Payment Instructions" task list item
   * and waits for the URL to reach the download-payment-instructions route.
   *
   * Uses expect.toPass to retry the entire "locate + click + navigate" block.
   */
  async clickDownloadPaymentInstructions(options?: { timeout?: number }) {
    const timeout = options?.timeout ?? 30_000;

    const labelRegex = new RegExp(
      ComplianceTaskTitles.DOWNLOAD_PAYMENT_INSTRUCTIONS,
      "i",
    );

    await expect(async () => {
      const button = this.page.getByRole("button", { name: labelRegex });
      const count = await button.count().catch(() => 0);
      expect(count).toBeGreaterThan(0);
      await expect(button).toBeVisible();
      await expect(button).toBeEnabled();

      await Promise.all([
        this.page.waitForURL(DOWNLOAD_PAYMENT_INSTRUCTIONS_URL_PATTERN, {
          timeout,
        }),
        button.click(),
      ]);

      await expect(this.page).toHaveURL(
        DOWNLOAD_PAYMENT_INSTRUCTIONS_URL_PATTERN,
      );
    }).toPass({ timeout });
  }
}

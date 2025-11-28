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
   */
  async clickDownloadPaymentInstructions() {
    const labelRegex = new RegExp(
      ComplianceTaskTitles.DOWNLOAD_PAYMENT_INSTRUCTIONS,
      "i",
    );

    // Task list items are MUI ListItemButton → role="button"
    const button = this.page.getByRole("button", { name: labelRegex });

    await expect(button).toBeVisible();

    await Promise.all([
      this.page.waitForURL(DOWNLOAD_PAYMENT_INSTRUCTIONS_URL_PATTERN),
      button.click(),
    ]);
  }
}

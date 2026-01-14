import { Page, expect } from "@playwright/test";
import { ComplianceTaskTitles } from "@/compliance-e2e/utils/enums";
import { REQUEST_ISSUANCE_CREDITS_URL_PATTERN } from "@/compliance-e2e/utils/constants";

export class RequestIssuanceTaskListPOM {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Clicks the "Request Issuance of Earned Credits" task list item
   * and waits for the URL to reach the route.
   */
  async clickRequestIssuance() {
    const labelRegex = new RegExp(ComplianceTaskTitles.REQUEST_ISSUANCE, "i");

    const button = this.page.getByRole("button", { name: labelRegex });

    await expect(button).toBeVisible();

    await Promise.all([
      this.page.waitForURL(REQUEST_ISSUANCE_CREDITS_URL_PATTERN),
      button.click(),
    ]);
  }
}

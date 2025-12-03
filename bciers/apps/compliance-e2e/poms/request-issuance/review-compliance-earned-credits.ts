import { Locator, Page, expect } from "@playwright/test";
import { ISSUANCE_STATUS_FIELD } from "@/compliance-e2e/utils/constants";

export class ReviewComplianceEarnedCreditsPOM {
  constructor(private readonly page: Page) {}

  /**
   * Assert that the issuance_status field has value.
   */

  get issuanceStatusField(): Locator {
    return this.page.locator(ISSUANCE_STATUS_FIELD);
  }

  async getIssuanceStatusText(): Promise<string> {
    await this.issuanceStatusField.waitFor();
    const text = (await this.issuanceStatusField.textContent()) ?? "";
    return text.trim();
  }

  async assertIssuanceStatusValue(expected: string) {
    await expect(this.issuanceStatusField).toBeVisible();
    const text = await this.getIssuanceStatusText();
    await expect(text).toBe(expected);
  }
}

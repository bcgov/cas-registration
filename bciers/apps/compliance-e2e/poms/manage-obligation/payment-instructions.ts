import { Locator, Page, expect } from "@playwright/test";
import { INVOICE_NUMBER_FIELD } from "@/compliance-e2e/utils/constants";

export class PaymentInstructionsPOM {
  private readonly page: Page;

  private readonly invoiceNumberField: Locator;

  constructor(page: Page) {
    this.page = page;

    this.invoiceNumberField = this.page.locator(INVOICE_NUMBER_FIELD);
  }
  /**
   * Assert that the invoice_number field has *some* value.
   */
  async assertHasInvoiceNumber() {
    await expect(this.invoiceNumberField).toBeVisible();
    const text = (await this.invoiceNumberField.textContent())?.trim() || "";
    await expect(text.length).toBeGreaterThan(0);
  }
}

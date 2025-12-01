import { Locator, Page, expect } from "@playwright/test";
import { INVOICE_NUMBER_FIELD } from "@/compliance-e2e/utils/constants";

export class PaymentInstructionsPOM {
  constructor(private readonly page: Page) {}

  /**
   * Assert that the invoice_number field has *some* value.
   */

  get invoiceNumberValue(): Locator {
    return this.page.locator(INVOICE_NUMBER_FIELD);
  }

  async assertHasInvoiceNumber() {
    await expect(this.invoiceNumberValue).toBeVisible();
    const text = (await this.invoiceNumberValue.textContent())?.trim() || "";
    expect(text.length).toBeGreaterThan(0);
  }
}

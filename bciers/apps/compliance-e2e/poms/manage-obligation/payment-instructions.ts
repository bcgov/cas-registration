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

  /**
   * Hides the invoice number from Happo. The e2e stub generates a new invoice number for each invoice,
   * so it would otherwise produce a diff every run. Call after assertHasInvoiceNumber, which checks the real value.
   */
  async hideFromScreenshot(): Promise<void> {
    await this.invoiceNumberField.evaluate((el) => {
      el.dataset.happoHide = "";
    });
  }
}

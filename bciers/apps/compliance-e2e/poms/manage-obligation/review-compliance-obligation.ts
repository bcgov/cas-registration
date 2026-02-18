import { Locator, Page, expect, Response } from "@playwright/test";
import { GENERATE_INVOICE_BUTTON_TEXT } from "@/compliance-e2e/utils/constants";

export class ReviewComplianceObligationPOM {
  private readonly page: Page;
  private readonly invoiceButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.invoiceButton = this.page.getByRole("button", {
      name: GENERATE_INVOICE_BUTTON_TEXT,
      exact: true,
    });
  }

  /**
   * Clicks "Generate Invoice" and waits for the invoice PDF response.
   * Throws if the response is JSON (error path) or not OK.
   */
  async generateInvoiceAndWaitForPdf(
    complianceReportVersionId: number | string,
    type:
      | "obligation"
      | "automatic-overdue-penalty"
      | "late-submission-penalty",
  ): Promise<Response> {
    const invoiceUrl = new RegExp(
      `/compliance/api/invoice/${complianceReportVersionId}/${type}(\\?|$)`,
    );

    const [response] = await Promise.all([
      this.page.waitForResponse((r) => invoiceUrl.test(r.url())),
      this.clickGenerateInvoice(),
    ]);

    expect(response.ok()).toBe(true);

    const contentType = response.headers()["content-type"] ?? "";
    expect(contentType).not.toMatch(/application\/json/i);
    expect(contentType).toMatch(/application\/pdf|application\/octet-stream/i);

    return response;
  }

  async clickGenerateInvoice(): Promise<void> {
    await expect(this.invoiceButton).toBeVisible();
    await expect(this.invoiceButton).toBeEnabled();
    await this.invoiceButton.click();
  }
}

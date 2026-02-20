import { Locator, Page, expect } from "@playwright/test";
import {
  COMPLIANCE_INVOICE_API_BASE,
  ComplianceInvoiceType,
  GENERATE_INVOICE_BUTTON_TEXT,
} from "@/compliance-e2e/utils/constants";

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
   * Clicks "Generate Invoice" and returns the PDF buffer.
   * Throws if the response is JSON (error path) or not OK.
   */

  async generateInvoiceAndGetPdfBuffer(
    complianceReportVersionId: number | string,
    type: ComplianceInvoiceType,
  ): Promise<Buffer> {
    const id = String(complianceReportVersionId).trim();
    const invoiceUrl = new RegExp(
      `${COMPLIANCE_INVOICE_API_BASE}/${id}/${type}(\\?|$)`,
    );
    const [response] = await Promise.all([
      this.page.waitForResponse((r) => invoiceUrl.test(r.url()), {
        timeout: 60_000,
      }),
      this.clickGenerateInvoice(),
    ]);

    const contentType = response.headers()["content-type"] ?? "";

    expect(response.ok()).toBe(true);
    expect(contentType).not.toMatch(/application\/json/i);
    expect(contentType).toMatch(/application\/pdf|application\/octet-stream/i);

    return Buffer.from(await response.body());
  }

  private async clickGenerateInvoice(): Promise<void> {
    await expect(this.invoiceButton).toBeVisible({ timeout: 30_000 });
    await expect(this.invoiceButton).toBeEnabled({ timeout: 30_000 });
    await this.invoiceButton.click();
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}

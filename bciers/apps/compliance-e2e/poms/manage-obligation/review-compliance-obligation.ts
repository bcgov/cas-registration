import { Locator, Page, Request, Response, expect } from "@playwright/test";
import {
  COMPLIANCE_INVOICE_API_BASE,
  ComplianceInvoiceType,
  GENERATE_INVOICE_BUTTON_TEXT,
  INVOICE_GENERATION_TIMEOUT_MS,
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
      this.waitForInvoicePdf(invoiceUrl),
      this.clickGenerateInvoice(),
    ]);

    const contentType = response.headers()["content-type"] ?? "";

    expect(response.ok()).toBe(true);
    expect(contentType).not.toMatch(/application\/json/i);
    expect(contentType).toMatch(/application\/pdf|application\/octet-stream/i);

    return Buffer.from(await response.body());
  }

  /**
   * Waits for the invoice PDF response.
   *
   * Two requests hit this URL per click. `generateInvoice` fetches it to detect
   * errors, then points a preview tab at the same URL so the PDF renders inline
   * with its real filename — and that navigation is *expected* to abort, because
   * Chromium aborts a navigation that turns into a download. Only the fetch is
   * the real response, so match on that alone.
   *
   * A failed request emits no `response` event, so without racing `requestfailed`
   * a cancelled fetch would hang for the whole timeout and report nothing useful.
   */
  private async waitForInvoicePdf(invoiceUrl: RegExp): Promise<Response> {
    const isInvoiceFetch = (request: Request) =>
      invoiceUrl.test(request.url()) && request.resourceType() === "fetch";

    let onRequestFailed: (request: Request) => void = () => {};

    const failed = new Promise<never>((_, reject) => {
      onRequestFailed = (request: Request) => {
        if (!isInvoiceFetch(request)) return;
        reject(
          new Error(
            `Invoice request failed: ${request.failure()?.errorText ?? "unknown"}`,
          ),
        );
      };
      this.page.on("requestfailed", onRequestFailed);
    });

    try {
      return await Promise.race([
        this.page.waitForResponse((r) => isInvoiceFetch(r.request()), {
          timeout: INVOICE_GENERATION_TIMEOUT_MS,
        }),
        failed,
      ]);
    } finally {
      this.page.off("requestfailed", onRequestFailed);
    }
  }

  private async clickGenerateInvoice(): Promise<void> {
    await expect(this.invoiceButton).toBeVisible({ timeout: 30_000 });
    await expect(this.invoiceButton).toBeEnabled({ timeout: 30_000 });
    await this.invoiceButton.click();
  }
}

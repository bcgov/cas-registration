import { Page } from "@playwright/test";
import { pool } from "@bciers/e2e/utils/pool";

export type InvoiceGenerationGateState = "open" | "closed";

export class ComplianceSetupPOM {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Prime the invoice-generation gate by setting invoice_generation_date to be:
   *  - "open"   → yesterday  → integration allowed
   *  - "closed" → far future → integration blocked
   */
  async primeInvoiceGenerationGate(state: InvoiceGenerationGateState) {
    const reportingYear = new Date().getFullYear() - 1;

    const invoiceGenerationDate =
      state === "open"
        ? new Date(Date.now() - 24 * 60 * 60 * 1000) // yesterday => reached
        : new Date(Date.now() + 50 * 365 * 24 * 60 * 60 * 1000); // far future => not reached

    const res = await pool.query({
      text: `
        UPDATE erc.compliance_period cp
        SET invoice_generation_date = $2
        FROM erc.reporting_year ry
        WHERE cp.reporting_year_id = ry.reporting_year
        AND ry.reporting_year = $1
        RETURNING cp.reporting_year_id, cp.invoice_generation_date;
      `,
      values: [reportingYear, invoiceGenerationDate],
    });

    if (res.rowCount !== 1) {
      throw new Error(
        `primeInvoiceGenerationGate: expected 1 row for reporting_year=${reportingYear}, got ${res.rowCount}`,
      );
    }

    return res.rows[0];
  }
}

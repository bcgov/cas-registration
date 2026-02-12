import { Page } from "@playwright/test";
import { pool } from "@bciers/e2e/utils/pool";

export class ReportsPOM {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async primeReportingYear(isOpen: boolean) {
    const reportingYear = new Date().getFullYear() - 1;

    const reportOpenDate = isOpen
      ? new Date(Date.now() - 24 * 60 * 60 * 1000) // yesterday => open
      : new Date(Date.now() + 50 * 365 * 24 * 60 * 60 * 1000); // far future => closed

    const res = await pool.query({
      text: `
        UPDATE erc.reporting_year
        SET report_open_date = $2
        WHERE reporting_year = $1
        RETURNING reporting_year, report_open_date;
      `,
      values: [reportingYear, reportOpenDate],
    });

    if (res.rowCount !== 1) {
      throw new Error(
        `primeReportingYear: expected 1 row for reporting_year=${reportingYear}, got ${res.rowCount}`,
      );
    }

    return res.rows[0];
  }
}

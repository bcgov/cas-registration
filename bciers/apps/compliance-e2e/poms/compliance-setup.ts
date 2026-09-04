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

  /**
   * Force a compliance obligation's submission timestamp to be after both:
   * - reporting report due date (typically May 31)
   * - compliance deadline
   *
   * This ensures supplementary obligations qualify as "late submission"
   * for GGEAPAR scenarios in tests.
   */
  private async resolveComplianceReportVersionId(inputId: number) {
    const directMatch = await pool.query({
      text: `
        SELECT crv.id
        FROM erc.compliance_report_version crv
        WHERE crv.id = $1;
      `,
      values: [inputId],
    });

    if (directMatch.rowCount === 1) {
      return Number(directMatch.rows[0].id);
    }

    const reportVersionMatch = await pool.query({
      text: `
        SELECT crv.id
        FROM erc.compliance_report_version crv
        JOIN erc.report_compliance_summary rcs
          ON rcs.id = crv.report_compliance_summary_id
        WHERE rcs.report_version_id = $1
        ORDER BY crv.id DESC
        LIMIT 1;
      `,
      values: [inputId],
    });

    if (reportVersionMatch.rowCount === 1) {
      return Number(reportVersionMatch.rows[0].id);
    }

    throw new Error(
      `primeObligationSubmittedAfterDeadlines: no compliance_report_version found for input id=${inputId} (checked both compliance_report_version.id and reporting.report_version_id)`,
    );
  }

  async primeObligationSubmittedAfterDeadlines(
    complianceReportVersionId: number,
  ) {
    const resolvedComplianceReportVersionId =
      await this.resolveComplianceReportVersionId(complianceReportVersionId);

    const obligationLookup = await pool.query({
      text: `
        SELECT
          crv.id AS compliance_report_version_id,
          crv.status,
          crv.is_supplementary,
          co.id AS compliance_obligation_id
        FROM erc.compliance_report_version crv
        LEFT JOIN erc.compliance_obligation co
          ON co.compliance_report_version_id = crv.id
        WHERE crv.id = $1;
      `,
      values: [resolvedComplianceReportVersionId],
    });

    if (obligationLookup.rowCount !== 1) {
      throw new Error(
        `primeObligationSubmittedAfterDeadlines: compliance_report_version_id=${resolvedComplianceReportVersionId} was not found`,
      );
    }

    const target = obligationLookup.rows[0];
    if (!target.compliance_obligation_id) {
      const hasNoObligationStatus = /no obligation/i.test(
        String(target.status ?? ""),
      );

      if (target.is_supplementary && hasNoObligationStatus) {
        return {
          compliance_report_version_id: resolvedComplianceReportVersionId,
          skipped: true,
          reason:
            "No compliance obligation exists for this supplementary version status",
        };
      }

      throw new Error(
        `primeObligationSubmittedAfterDeadlines: expected an obligation for compliance_report_version_id=${resolvedComplianceReportVersionId}, but none exists (status=${target.status})`,
      );
    }

    const res = await pool.query({
      text: `
        UPDATE erc.compliance_obligation co
        SET created_at = (
          GREATEST(
            cp.compliance_deadline,
            (ry.report_due_date AT TIME ZONE 'UTC')::date
          ) + INTERVAL '1 day'
        )
        FROM erc.compliance_report_version crv
        JOIN erc.compliance_report cr ON cr.id = crv.compliance_report_id
        JOIN erc.compliance_period cp ON cp.id = cr.compliance_period_id
        JOIN erc.reporting_year ry ON ry.reporting_year = cp.reporting_year_id
        WHERE co.compliance_report_version_id = crv.id
          AND crv.id = $1
        RETURNING co.compliance_report_version_id, co.created_at;
      `,
      values: [resolvedComplianceReportVersionId],
    });

    if (res.rowCount !== 1) {
      throw new Error(
        `primeObligationSubmittedAfterDeadlines: expected 1 row for compliance_report_version_id=${resolvedComplianceReportVersionId}, got ${res.rowCount}`,
      );
    }

    return res.rows[0];
  }
}

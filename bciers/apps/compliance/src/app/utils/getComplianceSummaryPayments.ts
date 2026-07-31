import { actionHandler } from "@bciers/actions";
import { PaymentData } from "@/compliance/src/app/types";

export async function getComplianceSummaryPayments(
  complianceReportVersionId: number,
): Promise<PaymentData> {
  const data = await actionHandler(
    `compliance/compliance-report-versions/${complianceReportVersionId}/obligation/payments`,
    "GET",
    "",
  );

  return {
    rows: data.rows,
    row_count: data.row_count,
  };
}

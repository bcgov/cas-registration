import { getComplianceSummary } from "@/compliance/src/app/utils/getComplianceSummary";
import { getComplianceSummaryPayments } from "@/compliance/src/app/utils/getComplianceSummaryPayments";
import getComplianceAppliedUnits from "@/compliance/src/app/utils/getComplianceAppliedUnits";
import { ComplianceSummaryReviewPageData } from "@/compliance/src/app/types";

export async function fetchComplianceSummaryReviewPageData(
  complianceReportVersionId: string,
): Promise<ComplianceSummaryReviewPageData> {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const [
    complianceReportVersion,
    monetaryPayments,
    appliedComplianceUnitsData,
  ] = await Promise.all([
    getComplianceSummary(complianceReportVersionId),
    getComplianceSummaryPayments(complianceReportVersionId),
    getComplianceAppliedUnits(complianceReportVersionId),
  ]);

  return {
    ...complianceReportVersion,
    monetary_payments: monetaryPayments,
    applied_units_summary: {
      compliance_report_version_id: complianceReportVersionId,
      applied_compliance_units: appliedComplianceUnitsData,
    },
  };
}

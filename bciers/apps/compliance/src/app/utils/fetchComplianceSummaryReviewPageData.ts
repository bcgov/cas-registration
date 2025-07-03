import { getComplianceSummary } from "@/compliance/src/app/utils/getComplianceSummary";
import { getComplianceSummaryPayments } from "@/compliance/src/app/utils/getComplianceSummaryPayments";
import getComplianceAppliedUnits from "@/compliance/src/app/utils/getComplianceAppliedUnits";
import { ComplianceSummaryReviewPageData } from "@/compliance/src/app/types";

export async function fetchComplianceSummaryReviewPageData(
  complianceReportVersionId: string,
): Promise<ComplianceSummaryReviewPageData> {
  const [
    compliance_report_version,
    monetary_payments,
    applied_compliance_units_data,
  ] = await Promise.all([
    getComplianceSummary(complianceReportVersionId),
    getComplianceSummaryPayments(complianceReportVersionId),
    getComplianceAppliedUnits(complianceReportVersionId),
  ]);
  const compliance_report_version_id = complianceReportVersionId;

  return {
    ...compliance_report_version,
    monetary_payments,
    applied_units_summary: {
      compliance_report_version_id,
      applied_compliance_units: applied_compliance_units_data,
    },
  };
}

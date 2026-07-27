import { getComplianceSummary } from "@/compliance/src/app/utils/getComplianceSummary";
import { getComplianceSummaryPayments } from "@/compliance/src/app/utils/getComplianceSummaryPayments";
import getComplianceAppliedUnits from "@/compliance/src/app/utils/getComplianceAppliedUnits";
import { getAccruingPenalties } from "@/compliance/src/app/utils/getAccruingPenalties";
import { ComplianceSummaryReviewPageData } from "@/compliance/src/app/types";

export async function fetchComplianceSummaryReviewPageData(
  complianceReportVersionId: number,
): Promise<ComplianceSummaryReviewPageData> {
  const [
    complianceReportVersion,
    monetaryPayments,
    appliedComplianceUnitsData,
    accruingPenalties,
  ] = await Promise.all([
    getComplianceSummary(complianceReportVersionId),
    getComplianceSummaryPayments(complianceReportVersionId),
    getComplianceAppliedUnits(complianceReportVersionId),
    getAccruingPenalties(complianceReportVersionId),
  ]);

  return {
    ...complianceReportVersion,
    ...accruingPenalties,
    monetary_payments: monetaryPayments,
    applied_units_summary: {
      compliance_report_version_id: complianceReportVersionId,
      applied_compliance_units: appliedComplianceUnitsData,
    },
  };
}

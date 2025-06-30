import { getComplianceSummary } from "@/compliance/src/app/utils/getComplianceSummary";
import { getComplianceSummaryPayments } from "@/compliance/src/app/utils/getComplianceSummaryPayments";
import getComplianceAppliedUnits from "@/compliance/src/app/utils/getComplianceAppliedUnits";
import { ComplianceSummaryReviewPageData } from "@/compliance/src/app/types";

export async function fetchComplianceSummaryReviewPageData(
  complianceSummaryId: string,
): Promise<ComplianceSummaryReviewPageData> {
  const [complianceSummary, monetary_payments, appliedComplianceUnitsData] =
    await Promise.all([
      getComplianceSummary(complianceSummaryId),
      getComplianceSummaryPayments(complianceSummaryId),
      getComplianceAppliedUnits(complianceSummaryId),
    ]);

  return {
    ...complianceSummary,
    monetary_payments,
    applied_compliance_units: {
      complianceSummaryId,
      appliedComplianceUnits: appliedComplianceUnitsData,
    },
  };
}

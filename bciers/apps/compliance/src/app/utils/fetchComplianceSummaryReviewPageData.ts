import { getComplianceSummary } from "@/compliance/src/app/utils/getComplianceSummary";
import { getComplianceSummaryPayments } from "@/compliance/src/app/utils/getComplianceSummaryPayments";
import { ComplianceSummaryReviewPageData } from "@/compliance/src/app/types";

export async function fetchComplianceSummaryReviewPageData(
  complianceSummaryId: string,
): Promise<ComplianceSummaryReviewPageData> {
  const [complianceSummary, monetary_payments] = await Promise.all([
    getComplianceSummary(complianceSummaryId),
    getComplianceSummaryPayments(complianceSummaryId),
  ]);

  return {
    ...complianceSummary,
    monetary_payments: {
      gridData: monetary_payments,
    },
  };
}

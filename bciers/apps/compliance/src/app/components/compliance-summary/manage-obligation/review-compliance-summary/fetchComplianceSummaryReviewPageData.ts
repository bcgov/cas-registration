import { getComplianceSummary } from "@/compliance/src/app/utils/getComplianceSummary";
import { getComplianceSummaryPayments } from "@/compliance/src/app/utils/getComplianceSummaryPayments";
import { PaymentsData } from "@/compliance/src/app/types";

interface ComplianceSummaryReviewPageData {
  complianceSummary: any;
  paymentsData: PaymentsData;
}

export async function fetchComplianceSummaryReviewPageData(
  complianceSummaryId: string,
): Promise<ComplianceSummaryReviewPageData> {
  const [complianceSummary, paymentsData] = await Promise.all([
    getComplianceSummary(complianceSummaryId),
    getComplianceSummaryPayments(complianceSummaryId),
  ]);

  return {
    complianceSummary,
    paymentsData,
  };
}

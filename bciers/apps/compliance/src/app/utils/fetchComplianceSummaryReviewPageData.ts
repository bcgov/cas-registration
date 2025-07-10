import { getComplianceSummary } from "@/compliance/src/app/utils/getComplianceSummary";
import { getObligationPayments } from "@/compliance/src/app/utils/getObligation";
import { PaymentData } from "@/compliance/src/app/types";

interface ComplianceSummaryReviewPageData {
  complianceSummary: any;
  paymentsData: PaymentData;
}

export async function fetchComplianceSummaryReviewPageData(
  complianceSummaryId: string,
): Promise<ComplianceSummaryReviewPageData> {
  const [complianceSummary, paymentsData] = await Promise.all([
    getComplianceSummary(complianceSummaryId),
    getObligationPayments(complianceSummaryId),
  ]);

  return {
    complianceSummary,
    paymentsData,
  };
}

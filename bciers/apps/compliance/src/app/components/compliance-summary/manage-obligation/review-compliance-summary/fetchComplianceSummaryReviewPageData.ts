import { getComplianceSummary } from "../../../utils/getComplianceSummary";
import { getComplianceSummaryPayments } from "../../../utils/getComplianceSummaryPayments";

interface ComplianceSummaryReviewPageData {
  complianceSummary: any;
  paymentsData: {
    rows: Array<{
      id: string | number;
      paymentReceivedDate: string;
      paymentAmountApplied: number;
      paymentMethod: string;
      transactionType: string;
      referenceNumber: string;
    }>;
    row_count: number;
  };
}

export async function fetchComplianceSummaryReviewPageData(
  complianceSummaryId: number,
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

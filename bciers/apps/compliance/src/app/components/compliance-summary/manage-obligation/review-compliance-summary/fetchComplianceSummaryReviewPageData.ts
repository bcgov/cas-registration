import { getComplianceReportVersion } from "@/compliance/src/app/utils/getComplianceReportVersion";
import { getComplianceSummaryPayments } from "@/compliance/src/app/utils/getComplianceSummaryPayments";
import {
  PaymentsData,
  ComplianceReportVersion,
} from "@/compliance/src/app/types";

interface ComplianceSummaryReviewPageData {
  complianceSummary: ComplianceReportVersion;
  paymentsData: PaymentsData;
}

export async function fetchComplianceSummaryReviewPageData(
  complianceReportVersionId: string,
): Promise<ComplianceSummaryReviewPageData> {
  const [complianceSummary, paymentsData] = await Promise.all([
    getComplianceReportVersion(complianceReportVersionId),
    getComplianceSummaryPayments(complianceReportVersionId),
  ]);

  return {
    complianceSummary,
    paymentsData,
  };
}

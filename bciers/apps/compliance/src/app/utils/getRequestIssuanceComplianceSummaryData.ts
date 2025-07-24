import { actionHandler } from "@bciers/actions";
import { RequestIssuanceComplianceSummaryData } from "@/compliance/src/app/types";

/**
 * Fetch the compliance report version data with issuance information
 * @param complianceReportVersionId The compliance report version id
 * @returns The compliance report version data with issuance information
 */
export const getRequestIssuanceComplianceSummaryData = async (
  complianceReportVersionId?: number,
): Promise<RequestIssuanceComplianceSummaryData> => {
  const endpoint = `compliance/compliance-report-versions/${complianceReportVersionId}/earned-credits`;
  const data = await actionHandler(endpoint, "GET", "");
  if (!data || data?.error) {
    throw new Error(
      `Failed to fetch issuance compliance summary for compliance report version ${complianceReportVersionId}.`,
    );
  }
  return data;
};

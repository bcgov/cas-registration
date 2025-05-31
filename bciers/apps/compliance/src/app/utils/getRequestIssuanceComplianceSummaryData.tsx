import { actionHandler } from "@bciers/actions";

/**
 * Fetch the compliance report version data with issuance information
 * @param complianceReportVersionId The compliance report version id
 * @returns The compliance report version data with issuance information
 */
export const getRequestIssuanceComplianceSummaryData = async (
  complianceReportVersionId?: string,
) => {
  const endpoint = `compliance/compliance-report-versions/${complianceReportVersionId}/earned-credits`;
  const data = await actionHandler(endpoint, "GET", "");

  if (data?.error) {
    throw new Error(
      `Failed to fetch issuance compliance summary for compliance report version ${complianceReportVersionId}.`,
    );
  }

  return data;
};

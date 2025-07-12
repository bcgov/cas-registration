import { RequestIssuanceTrackStatusData } from "@/compliance/src/app/types";
import { actionHandler } from "@bciers/actions";

export const getRequestIssuanceTrackStatusData = async (
  complianceReportVersionId: string,
): Promise<RequestIssuanceTrackStatusData> => {
  const endpoint = `compliance/compliance-report-versions/${complianceReportVersionId}/earned-credits`;
  const response = await actionHandler(endpoint, "GET", "");

  if (response?.error) {
    throw new Error(
      `Failed to fetch request issuance data for compliance report version ${complianceReportVersionId}: ${response.error}`,
    );
  }

  return response;
};

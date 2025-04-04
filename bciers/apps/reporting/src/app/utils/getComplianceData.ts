import { actionHandler } from "@bciers/actions";
export async function getComplianceData(reportVersionId: number) {
  const endpoint = `reporting/report-version/${reportVersionId}/compliance-data`;
  const response = await actionHandler(endpoint, "GET");
  if (response.error) {
    throw new Error(
      `Failed to fetch the compliance data for report version ${reportVersionId}.`,
    );
  }
  return response;
}

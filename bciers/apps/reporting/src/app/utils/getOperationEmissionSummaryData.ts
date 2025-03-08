import { actionHandler } from "@bciers/actions";

export async function getOperationEmissionSummaryData(reportVersionId: number) {
  const endpoint = `reporting/report-version/${reportVersionId}/emission-summary`;
  const response = await actionHandler(endpoint, "GET");
  if (response.error) {
    throw new Error(
      `Failed to fetch the operation emissions summary data for report version ${reportVersionId}.`,
    );
  }
  return response;
}

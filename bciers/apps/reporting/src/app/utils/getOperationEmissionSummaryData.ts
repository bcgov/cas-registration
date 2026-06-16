import { actionHandler } from "@bciers/actions";

export async function getOperationEmissionSummaryData(reportVersionId: number) {
  const endpoint = `reporting/report-version/${reportVersionId}/emission-summary`;
  const response = await actionHandler(endpoint, "GET");

  return response;
}

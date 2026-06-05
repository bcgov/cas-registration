import { actionHandler } from "@bciers/actions";

export async function getSummaryData(
  reportVersionId: number,
  facilityId: string,
) {
  const endpoint = `reporting/report-version/${reportVersionId}/facility-report/${facilityId}/emission-summary`;
  const response = await actionHandler(endpoint, "GET");

  return response;
}

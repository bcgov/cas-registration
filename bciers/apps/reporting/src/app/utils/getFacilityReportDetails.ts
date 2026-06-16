import { actionHandler } from "@bciers/actions";

export async function getFacilityReportDetails(
  reportVersionId: number,
  facilityId: string,
) {
  const endpoint = `reporting/report-version/${reportVersionId}/facility-report/${facilityId}`;
  const response = await actionHandler(endpoint, "GET");

  return response;
}

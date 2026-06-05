import { actionHandler } from "@bciers/actions";

export async function getReportFacilityList(reportVersionId: number) {
  const endpoint = `reporting/report-version/${reportVersionId}/facility-list`;
  const response = await actionHandler(endpoint, "GET");

  return response;
}

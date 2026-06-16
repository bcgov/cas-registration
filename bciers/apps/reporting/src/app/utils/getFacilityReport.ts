import { actionHandler } from "@bciers/actions";

export async function getFacilityReport(reportVersionId: number) {
  const endpoint = `reporting/report-version/${reportVersionId}/facility-report`;
  const response = await actionHandler(endpoint, "GET");

  return response;
}

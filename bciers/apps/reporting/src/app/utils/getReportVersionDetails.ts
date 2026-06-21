import { actionHandler } from "@bciers/actions";

export async function getReportVersionDetails(reportVersionId: number) {
  const endpoint = `reporting/report-version/${reportVersionId}`;
  const response = await actionHandler(endpoint, "GET");

  return response;
}

import { actionHandler } from "@bciers/actions";

export async function getReportSignOff(reportVersionId: number) {
  const endpoint = `reporting/report-version/${reportVersionId}/sign-off`;
  const response = await actionHandler(endpoint, "GET");

  return response;
}

import { actionHandler } from "@bciers/actions";

export async function getReportVerification(reportVersionId: number) {
  const endpoint = `reporting/report-version/${reportVersionId}/report-verification`;
  const response = await actionHandler(endpoint, "GET");

  return response;
}

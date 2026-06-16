import { actionHandler } from "@bciers/actions";

export async function getReportAdditionalData(reportVersionId: number) {
  const endpoint = `reporting/report-version/${reportVersionId}/report-additional-data`;
  const response = await actionHandler(endpoint, "GET");

  return response;
}

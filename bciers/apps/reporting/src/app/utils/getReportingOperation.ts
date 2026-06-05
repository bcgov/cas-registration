import { actionHandler } from "@bciers/actions";

export async function getReportingOperation(reportVersionId: number) {
  const endpoint = `reporting/report-version/${reportVersionId}/report-operation`;
  const response = await actionHandler(endpoint, "GET");

  return response;
}

import { actionHandler } from "@bciers/actions";

export async function getReportInformationData(reportVersionId: number) {
  const endpoint = `reporting/report-version/${reportVersionId}/review-facilities`;
  const response = await actionHandler(endpoint, "GET");

  return response;
}

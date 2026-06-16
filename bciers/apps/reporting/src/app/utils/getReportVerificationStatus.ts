import { actionHandler } from "@bciers/actions";

export async function getReportVerificationStatus(reportVersionId: number) {
  const endpoint = `reporting/report-version/${reportVersionId}/report-verification-status`;
  const response = await actionHandler(endpoint, "GET");

  return response;
}

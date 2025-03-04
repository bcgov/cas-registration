import { actionHandler } from "@bciers/actions";

export async function getReportVerification(reportVersionId: number) {
  const endpoint = `reporting/report-version/${reportVersionId}/report-verification`;
  const response = await actionHandler(endpoint, "GET");
  if (response && response.error) {
    throw new Error(
      `Failed to fetch the report verification for report version ${reportVersionId}`,
    );
  }
  return response;
}

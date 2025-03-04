import { actionHandler } from "@bciers/actions";

export async function getReportAdditionalData(reportVersionId: number) {
  const endpoint = `reporting/report-version/${reportVersionId}/report-additional-data`;
  const response = await actionHandler(endpoint, "GET");
  if (response.error) {
    throw new Error(
      `Failed to fetch the additional data for report version ${reportVersionId}`,
    );
  }
  return response;
}

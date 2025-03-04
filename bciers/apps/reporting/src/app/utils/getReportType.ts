import { actionHandler } from "@bciers/actions";

export async function getReportType(reportVersionId: number) {
  const endpoint = `reporting/report-version/${reportVersionId}/report-type`;
  const response = await actionHandler(endpoint, "GET");
  if (response.error) {
    throw new Error(
      `Failed to fetch the report type for report version ${reportVersionId}`,
    );
  }
  return response;
}

import { actionHandler } from "@bciers/actions";

export async function getReportChange(reportVersionId: number) {
  const endpoint = `reporting/report-version/${reportVersionId}/report-change`;
  const response = await actionHandler(endpoint, "GET");
  if (response && response.error) {
    throw new Error(
      `Failed to fetch the report change for report version ${reportVersionId}.`,
    );
  }
  return response;
}

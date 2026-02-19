import { actionHandler } from "@bciers/actions";

export async function getReportOperationActivities(reportVersionId: number) {
  const endpoint = `reporting/report-version/${reportVersionId}/report-operation-activities`;
  const response = await actionHandler(endpoint, "GET");
  if (response.error) {
    throw new Error(
      `Failed to fetch the report operation activities for report version ${reportVersionId}.`,
    );
  }
  return response;
}

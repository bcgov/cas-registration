import { actionHandler } from "@bciers/actions";

export async function getFacilityReport(reportVersionId: number) {
  const endpoint = `reporting/report-version/${reportVersionId}/facility-report`;
  const response = await actionHandler(endpoint, "GET");
  if (response.error) {
    throw new Error(
      `Failed to fetch the facility for report version ${reportVersionId}.`,
    );
  }
  return response;
}

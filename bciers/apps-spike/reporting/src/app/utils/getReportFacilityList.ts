import { actionHandler } from "@bciers/actions";

export async function getReportFacilityList(reportVersionId: number) {
  const endpoint = `reporting/report-version/${reportVersionId}/facility-list`;
  const response = await actionHandler(endpoint, "GET");
  if (response.error) {
    throw new Error(
      `Failed to fetch the facility list for report version ${reportVersionId}.`,
    );
  }
  return response;
}

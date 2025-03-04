import { actionHandler } from "@bciers/actions";

export async function getSummaryData(
  reportVersionId: number,
  facilityId: string,
) {
  const endpoint = `reporting/report-version/${reportVersionId}/facility-report/${facilityId}/emission-summary`;
  const response = await actionHandler(endpoint, "GET");
  if (response.error) {
    throw new Error(
      `Failed to fetch the emission summary data for report version ${reportVersionId}, facility ${facilityId}`,
    );
  }
  return response;
}

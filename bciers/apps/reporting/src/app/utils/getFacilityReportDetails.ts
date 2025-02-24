import { actionHandler } from "@bciers/actions";

export async function getFacilityReportDetails(
  reportVersionId: number,
  facilityId: string,
) {
  const endpoint = `reporting/report-version/${reportVersionId}/facility-report/${facilityId}`;
  const response = await actionHandler(endpoint, "GET");
  if (response.error) {
    throw new Error(
      `Failed to fetch the facility details for report version ${reportVersionId}, facility ${facilityId}.\n` +
        "Please check if the provided ID(s) are correct and try again.",
    );
  }
  return response;
}

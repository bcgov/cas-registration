import { actionHandler } from "@bciers/actions";

export async function fetchFacilityReviewPageData(
  reportVersionId: number,
  facilityId: string,
) {
  const endpoint = `reporting/v2/report-version/${reportVersionId}/facility-report/${facilityId}`;
  const response = await actionHandler(endpoint, "GET");
  if (response.error) {
    throw new Error(
      `Failed to fetch the facility review data for report version ${reportVersionId}, facility ${facilityId}.`,
    );
  }
  return response;
}

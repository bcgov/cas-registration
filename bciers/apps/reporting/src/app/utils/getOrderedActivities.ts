import { actionHandler } from "@bciers/actions";

export async function getOrderedActivities(
  reportVersionId: number,
  facilityId: string,
) {
  const endpoint = `reporting/report-version/${reportVersionId}/facility-report/${facilityId}/activity-list`;
  const response = await actionHandler(endpoint, "GET");
  if (response.error) {
    throw new Error(
      `Failed to fetch the activity list for report version ${reportVersionId}, facility ${facilityId}`,
    );
  }
  return response;
}

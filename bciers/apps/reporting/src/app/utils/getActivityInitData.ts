import { actionHandler } from "@bciers/actions";

export async function getActivityInitData(
  reportVersionId: number,
  facilityId: string,
  activityId: number,
) {
  const endpoint = `reporting/report-version/${reportVersionId}/facility-report/${facilityId}/initial-activity-data?activity_id=${activityId}`;
  const response = await actionHandler(endpoint, "GET");
  if (response.error) {
    throw new Error(
      `Failed to fetch the activity init data for report version ${reportVersionId}, facility ${facilityId}, activity ${activityId}.\n` +
        "Please check if the provided ID(s) are correct and try again.",
    );
  }
  return response;
}

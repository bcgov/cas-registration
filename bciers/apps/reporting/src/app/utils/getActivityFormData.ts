import { actionHandler } from "@bciers/actions";

export async function getActivityFormData(
  reportVersionId: number,
  facilityId: string,
  activityId: number,
) {
  const endpoint = `reporting/report-version/${reportVersionId}/facilities/${facilityId}/activity/${activityId}/report-activity`;
  const response = await actionHandler(endpoint, "GET");
  if (response.error) {
    throw new Error(
      `Failed to fetch the activity list for report version ${reportVersionId}, facility ${facilityId}, activity ${activityId}.\n` +
        "Please check if the provided ID(s) are correct and try again.",
    );
  }
  return response;
}

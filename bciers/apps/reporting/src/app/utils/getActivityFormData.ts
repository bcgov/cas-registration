import { actionHandler } from "@bciers/actions";

export async function getActivityFormData(
  reportVersionId: number,
  facilityId: string,
  activityId: number,
) {
  const endpoint = `reporting/report-version/${reportVersionId}/facilities/${facilityId}/activity/${activityId}/report-activity`;
  const response = await actionHandler(endpoint, "GET");

  return response;
}

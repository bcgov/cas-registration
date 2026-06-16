import { actionHandler } from "@bciers/actions";

export async function getActivityInitData(
  reportVersionId: number,
  facilityId: string,
  activityId: number,
) {
  const endpoint = `reporting/report-version/${reportVersionId}/facility-report/${facilityId}/initial-activity-data?activity_id=${activityId}`;
  const response = await actionHandler(endpoint, "GET");

  return response;
}

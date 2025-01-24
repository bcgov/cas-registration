import { actionHandler } from "@bciers/actions";

export async function getActivityInitData(
  versionId: number,
  facilityId: string,
  activityId: number,
) {
  const response = await actionHandler(
    `reporting/report-version/${versionId}/facility-report/${facilityId}/initial-activity-data?activity_id=${activityId}`,
    "GET",
    "",
  );

  if (response.error) {
    throw new Error(
      `Error fetching activity init data for version ${versionId}, activity ${activityId}`,
    );
  }
  return response;
}

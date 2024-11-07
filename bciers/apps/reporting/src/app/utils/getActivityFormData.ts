import { actionHandler } from "@bciers/actions";

export async function getActivityFormData(
  versionId: number,
  facilityId: string,
  activityId: number,
) {
  const response = await actionHandler(
    `reporting/report-version/${versionId}/facilities/${facilityId}/activity/${activityId}/report-activity`,
    "GET",
    "",
  );
  if (response.error) {
    throw new Error("We couldn't find the activity list for this facility.");
  }
  return response;
}

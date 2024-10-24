import { actionHandler } from "@bciers/actions";

export async function getOrderedActivities(
  versionId: number,
  facilityId: string,
) {
  const orderedActivities = await actionHandler(
    `reporting/report-version/${versionId}/facility-report/${facilityId}/activity-list`,
    "GET",
    "",
  );
  if (orderedActivities.error) {
    throw new Error("We couldn't find the activity list for this facility.");
  }
  return orderedActivities;
}

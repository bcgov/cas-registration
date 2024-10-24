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
  return orderedActivities;
}

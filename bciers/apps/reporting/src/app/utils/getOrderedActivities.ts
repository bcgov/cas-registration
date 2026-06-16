import { actionHandler } from "@bciers/actions";

export async function getOrderedActivities(
  reportVersionId: number,
  facilityId: string,
) {
  const endpoint = `reporting/report-version/${reportVersionId}/facility-report/${facilityId}/activity-list`;
  const response = await actionHandler(endpoint, "GET");

  return response;
}

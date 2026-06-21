import { actionHandler } from "@bciers/actions";

export async function getActivitySchema(
  reportVersionId: number,
  activityId: number,
  sourceTypeQueryString: string,
  facilityId: string,
) {
  const endpoint = `reporting/build-form-schema?activity=${activityId}&report_version_id=${reportVersionId}&facility_id=${facilityId}${sourceTypeQueryString}`;
  const response = await actionHandler(endpoint, "GET");

  return response;
}

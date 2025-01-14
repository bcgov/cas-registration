import { actionHandler } from "@bciers/actions";

export async function getActivitySchema(
  versionId: number,
  activityId: number,
  sourceTypeQueryString: string,
) {
  const response = await actionHandler(
    `reporting/build-form-schema?activity=${activityId}&report_version_id=${versionId}${sourceTypeQueryString}`,
    "GET",
    "",
  );

  if (response.error) {
    throw new Error(
      `Error fetching schema for version ${versionId}, activity ${activityId}, source types ${sourceTypeQueryString}`,
    );
  }
  return response;
}

import { actionHandler } from "@bciers/actions";

export async function getActivitySchema(
  reportVersionId: number,
  activityId: number,
  sourceTypeQueryString: string,
) {
  const endpoint = `reporting/build-form-schema?activity=${activityId}&report_version_id=${reportVersionId}${sourceTypeQueryString}`;
  const response = await actionHandler(endpoint, "GET");
  if (response.error) {
    throw new Error(
      `Failed to fetch the schema for report version ${reportVersionId}, activity ${activityId}, source types ${sourceTypeQueryString}.\n` +
        "Please check if the provided ID(s) are correct and try again.",
    );
  }
  return response;
}

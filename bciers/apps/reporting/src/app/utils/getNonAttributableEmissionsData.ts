import { actionHandler } from "@bciers/actions";
export async function getNonAttributableEmissionsData(
  reportVersionId: number,
  facilityId: string,
) {
  const endpoint = `reporting/report-version/${reportVersionId}/facilities/${facilityId}/non-attributable`;
  const response = await actionHandler(endpoint, "GET");
  if (response.error) {
    throw new Error(
      `Failed to fetch the non attributable emissions data for report version ${reportVersionId}, facility ${facilityId}.\n` +
        "Please check if the provided ID(s) are correct and try again.",
    );
  }
  return response;
}

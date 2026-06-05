import { actionHandler } from "@bciers/actions";
export async function getNonAttributableEmissionsData(
  reportVersionId: number,
  facilityId: string,
) {
  const endpoint = `reporting/report-version/${reportVersionId}/facilities/${facilityId}/non-attributable`;
  const response = await actionHandler(endpoint, "GET");

  return response;
}

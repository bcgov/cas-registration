import { actionHandler } from "@bciers/actions";
export async function getNonAttributableEmissionsData(
  version_id: number,
  facilityId: string,
) {
  let response = await actionHandler(
    `reporting/report-version/${version_id}/facilities/${facilityId}/non-attributable`,
    "GET",
    `reporting/report-version/${version_id}/facilities/${facilityId}/non-attributable`,
  );

  if (response && !response.error) {
    return response;
  }
}

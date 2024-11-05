import { actionHandler } from "@bciers/actions";
import { UUID } from "crypto";
export async function getNonAttributableEmissionsData(
  version_id: number,
  facilityId: UUID,
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

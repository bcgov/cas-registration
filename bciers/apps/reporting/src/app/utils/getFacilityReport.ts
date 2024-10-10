import { actionHandler } from "@bciers/actions";
export async function getFacilityReport(version_id: number) {
  let response = await actionHandler(
    `reporting/report-version/${version_id}/facility-report`,
    "GET",
    `reporting/report-version/${version_id}/facility-report`,
  );
  if (response && !response.error) {
    return response;
  }
}

import { actionHandler } from "@bciers/actions";

export async function getReportFacilityList(version_id: number) {
  const response = await actionHandler(
    `reporting/report-version/${version_id}/facility-list`,
    "GET",
  );
  if (response && !response.error) {
    return response;
  }
}

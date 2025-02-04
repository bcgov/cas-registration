import { actionHandler } from "@bciers/actions";

export async function getFacilityReportDetails(
  version_id: number,
  facility_id: string,
) {
  return actionHandler(
    `reporting/report-version/${version_id}/facility-report/${facility_id}`,
    "GET",
    `reporting/report-version/${version_id}/facility-report/${facility_id}`,
  );
}

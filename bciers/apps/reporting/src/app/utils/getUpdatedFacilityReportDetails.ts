import { actionHandler } from "@bciers/actions";

export async function getUpdatedFacilityReportDetails(
  reportVersionId: number,
  facilityId: string,
) {
  return actionHandler(
    `reporting/report-version/${reportVersionId}/facility-report/${facilityId}/update`,
    "PUT",
    `reporting/reports/${reportVersionId}/facilities/${facilityId}/review-facility-information`,
  );
}

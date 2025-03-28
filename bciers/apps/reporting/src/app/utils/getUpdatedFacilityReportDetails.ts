import { actionHandler } from "@bciers/actions";

export async function getUpdatedFacilityReportDetails(
  reportVersionId: number,
  facilityId: string,
) {
  const endpoint = `reporting/report-version/${reportVersionId}/facility-report/${facilityId}/update`;
  const response = await actionHandler(endpoint, "PUT");
  if (response.error) {
    throw new Error(`Failed to fetch updated Facility Data`);
  }
  return response;
}

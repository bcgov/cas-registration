import { actionHandler } from "@bciers/actions";

export async function getOverlappingIndustrialProcessEmissions(
  reportVersionId: number,
  facilityId: string,
) {
  const endpoint = `reporting/report-version/${reportVersionId}/facility-report/${facilityId}/overlapping_industrial_process_emissions`;
  const response = await actionHandler(endpoint, "GET");

  return response;
}

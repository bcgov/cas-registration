import { actionHandler } from "@bciers/actions";

export async function getOverlappingIndustrialProcessEmissions(
  reportVersionId: number,
  facilityId: string,
) {
  const endpoint = `reporting/report-version/${reportVersionId}/facility-report/${facilityId}/overlapping_industrial_process_emissions`;
  const response = await actionHandler(endpoint, "GET");
  if (response.error) {
    throw new Error(
      `Failed to fetch overlapping industrial process emissions for report version ${reportVersionId}, facility ${facilityId}.`,
    );
  }
  return response;
}

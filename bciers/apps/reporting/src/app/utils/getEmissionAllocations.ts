import { actionHandler } from "@bciers/actions";

export type EmissionAllocationResponse = {
  report_product_emission_allocations: any[];
  facility_total_emissions: number;
  report_product_emission_allocation_totals: any[];
  allocation_methodology: string;
  allocation_other_methodology_description: string;
  has_missing_products: boolean;
};

export async function getEmissionAllocations(
  reportVersionId: number,
  facilityId: string,
) {
  const endpoint = `reporting/report-version/${reportVersionId}/facilities/${facilityId}/allocate-emissions`;
  const response = await actionHandler(endpoint, "GET");
  if (response.error) {
    throw new Error(
      `Failed to fetch the emission allocations for report version ${reportVersionId}, facility ${facilityId}.`,
    );
  }
  return response as EmissionAllocationResponse;
}

import { actionHandler } from "@bciers/actions";
import { FacilityData, OperationData, ReportData } from "./typesApiV2";

export type EmissionAllocationResponse = {
  report_product_emission_allocations: any[];
  facility_total_emissions: number;
  report_product_emission_allocation_totals: any[];
  allocation_methodology: string;
  allocation_other_methodology_description: string;
  has_missing_products: boolean;
};

export type EmissionAllocationFormResponseData = {
  payload: {
    emission_allocation_data: EmissionAllocationResponse;
    ordered_activities: {
      id: number;
      name: string;
      slug: string;
    }[];
    overlapping_industrial_process_emissions: number;
  };
  report_data: ReportData;
  facility_data: FacilityData;
  operation_data: OperationData;
};

export async function getEmissionAllocationPageData(
  reportVersionId: number,
  facilityId: string,
) {
  const endpoint = `reporting/v2/report-version/${reportVersionId}/facilities/${facilityId}/forms/emission-allocation-data`;
  const response = await actionHandler(endpoint, "GET", endpoint);

  if (response.error)
    throw new Error(
      `Failed to fetch the emission allocations for report version ${reportVersionId}, facility ${facilityId}.`,
    );

  return response as EmissionAllocationFormResponseData;
}

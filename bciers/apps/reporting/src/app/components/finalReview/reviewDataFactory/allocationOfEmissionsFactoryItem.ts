import { getEmissionAllocations } from "@reporting/src/app/utils/getEmissionAllocations";
import { ReviewDataFactoryItem } from "./factory";
import { emissionAllocationSchema } from "@reporting/src/data/jsonSchema/facility/facilityEmissionAllocation";
import { calculateEmissionData } from "../../facility/calculateEmissionsData";

const allocationOfEmissionsFactoryItem: ReviewDataFactoryItem = async (
  versionId,
  facilityId,
) => {
  const initialData = await getEmissionAllocations(versionId, facilityId);

  const formData = {
    allocation_methodology: initialData.allocation_methodology,
    allocation_other_methodology_description:
      initialData.allocation_other_methodology_description,
    basic_emission_allocation_data:
      initialData.report_product_emission_allocations
        .filter((category: any) => category.category_type === "basic")
        .map(calculateEmissionData),
    fuel_excluded_emission_allocation_data:
      initialData.report_product_emission_allocations
        .filter((category: any) => category.category_type === "fuel_excluded")
        .map(calculateEmissionData),
    total_emission_allocations: {
      facility_total_emissions: initialData.facility_total_emissions,
      products: initialData.report_product_emission_allocation_totals,
    },
  };

  return [
    {
      schema: emissionAllocationSchema,
      data: formData,
      uiSchema: "emissionAllocation",
      context: {
        facility_emission_data: formData.basic_emission_allocation_data.concat(
          formData.fuel_excluded_emission_allocation_data,
        ),
        total_emission_allocations: formData.total_emission_allocations,
      },
    },
  ];
};

export default allocationOfEmissionsFactoryItem;

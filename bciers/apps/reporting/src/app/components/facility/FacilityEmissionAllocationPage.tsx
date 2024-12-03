import { getOrderedActivities } from "@reporting/src/app/utils/getOrderedActivities";
import { getEmissionAllocations } from "@reporting/src/app/utils/getEmissionAllocations";
import Form from "@reporting/src/app/components/facility/FacilityEmissionAllocationForm";

export default async function FacilityEmissionAllocationPage({
  version_id,
  facility_id,
}: {
  version_id: number;
  facility_id: string;
}) {
  const orderedActivities = await getOrderedActivities(version_id, facility_id);
  const response = await getEmissionAllocations(version_id, facility_id);
  const initialDataTODO = response["report_product_emission_allocations"];

  const initialData = {
    methodology: "Other",
    other_methodology_description: "A test",
    facility_total_emissions: 1000,
    report_product_emission_allocations: [
      {
        emission_category: "flaring",
        category_type: "basic",
        products: [
          {
            product_id: 1,
            product_name: "BC-specific refinery complexity throughput",
            product_emission: 0,
          },
        ],
        emission_total: 0,
      },
      {
        emission_category: "fugitive",
        category_type: "basic",
        products: [
          {
            product_id: 1,
            product_name: "BC-specific refinery complexity throughput",
            product_emission: 10,
          },
        ],
        emission_total: 10,
      },
      {
        emission_category: "industrial_process",
        category_type: "basic",
        products: [
          {
            product_id: 1,
            product_name: "BC-specific refinery complexity throughput",
            product_emission: 20,
          },
        ],
        emission_total: 200,
      },
      {
        emission_category: "onsite",
        category_type: "basic",
        products: [
          {
            product_id: 1,
            product_name: "BC-specific refinery complexity throughput",
            product_emission: 0,
          },
        ],
        emission_total: 400,
      },
      {
        emission_category: "stationary",
        category_type: "basic",
        products: [
          {
            product_id: 1,
            product_name: "BC-specific refinery complexity throughput",
            product_emission: 0,
          },
        ],
        emission_total: 500,
      },
      {
        emission_category: "venting_useful",
        category_type: "basic",
        products: [
          {
            product_id: 1,
            product_name: "BC-specific refinery complexity throughput",
            product_emission: 0,
          },
        ],
        emission_total: 600,
      },
      {
        emission_category: "venting_non_useful",
        category_type: "basic",
        products: [
          {
            product_id: 1,
            product_name: "BC-specific refinery complexity throughput",
            product_emission: 0,
          },
        ],
        emission_total: 700,
      },
      {
        emission_category: "waste",
        category_type: "basic",
        products: [
          {
            product_id: 1,
            product_name: "BC-specific refinery complexity throughput",
            product_emission: 0,
          },
        ],
        emission_total: 800,
      },
      {
        emission_category: "wastewater",
        category_type: "basic",
        products: [
          {
            product_id: 1,
            product_name: "BC-specific refinery complexity throughput",
            product_emission: 0,
          },
        ],
        emission_total: 900,
      },
      {
        emission_category: "woody_biomass",
        category_type: "fuel_excluded",
        products: [
          {
            product_id: 1,
            product_name: "BC-specific refinery complexity throughput",
            product_emission: 100,
          },
        ],
        emission_total: 1000,
      },
      {
        emission_category: "excluded_biomass",
        category_type: "fuel_excluded",
        products: [
          {
            product_id: 1,
            product_name: "BC-specific refinery complexity throughput",
            product_emission: 0,
          },
        ],
        emission_total: 20,
      },
      {
        emission_category: "excluded_non_biomass",
        category_type: "fuel_excluded",
        products: [
          {
            product_id: 1,
            product_name: "BC-specific refinery complexity throughput",
            product_emission: 0,
          },
        ],
        emission_total: 50,
      },
    ],
  };

  return (
    <Form
      version_id={version_id}
      facility_id={facility_id}
      orderedActivities={orderedActivities}
      initialData={initialData}
    />
  );
}

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
  // console.log(response);
  const initialData1 = {
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
            allocated_quantity: 0,
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
            allocated_quantity: 10,
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
            allocated_quantity: 20,
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
            allocated_quantity: 0,
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
            allocated_quantity: 0,
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
            allocated_quantity: 0,
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
            allocated_quantity: 0,
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
            allocated_quantity: 0,
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
            allocated_quantity: 0,
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
            allocated_quantity: 100,
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
            allocated_quantity: 0,
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
            allocated_quantity: 0,
          },
        ],
        emission_total: 50,
      },
    ],
  };
  const initialData = {
    report_product_emission_allocations: [
      {
        emission_category: "Flaring emissions",
        products: [
          {
            product_id: 1,
            product_name: "BC-specific refinery complexity throughput",
            allocated_quantity: 200.0,
          },
          {
            product_id: 29,
            product_name: "Sugar: solid",
            allocated_quantity: 100.0,
          },
        ],
        emission_total: 300,
        category_type: "basic",
      },
      {
        emission_category: "Fugitive emissions",
        products: [
          {
            product_id: 1,
            product_name: "BC-specific refinery complexity throughput",
            allocated_quantity: 20,
          },
          {
            product_id: 29,
            product_name: "Sugar: solid",
            allocated_quantity: 10,
          },
        ],
        emission_total: 30,
        category_type: "basic",
      },
      {
        emission_category: "Industrial process emissions",
        products: [
          {
            product_id: 1,
            product_name: "BC-specific refinery complexity throughput",
            allocated_quantity: 2,
          },
          {
            product_id: 29,
            product_name: "Sugar: solid",
            allocated_quantity: 1,
          },
        ],
        emission_total: 3,
        category_type: "basic",
      },
      {
        emission_category: "On-site transportation emissions",
        products: [
          {
            product_id: 1,
            product_name: "BC-specific refinery complexity throughput",
            allocated_quantity: 0,
          },
          {
            product_id: 29,
            product_name: "Sugar: solid",
            allocated_quantity: 0,
          },
        ],
        emission_total: 50,
        category_type: "basic",
      },
      {
        emission_category: "Stationary fuel combustion emissions",
        products: [
          {
            product_id: 1,
            product_name: "BC-specific refinery complexity throughput",
            allocated_quantity: 0,
          },
          {
            product_id: 29,
            product_name: "Sugar: solid",
            allocated_quantity: 0,
          },
        ],
        emission_total: 0,
        category_type: "basic",
      },
      {
        emission_category: "Venting emissions — useful",
        products: [
          {
            product_id: 1,
            product_name: "BC-specific refinery complexity throughput",
            allocated_quantity: 0,
          },
          {
            product_id: 29,
            product_name: "Sugar: solid",
            allocated_quantity: 0,
          },
        ],
        emission_total: 0,
        category_type: "basic",
      },
      {
        emission_category: "Venting emissions — non-useful",
        products: [
          {
            product_id: 1,
            product_name: "BC-specific refinery complexity throughput",
            allocated_quantity: 0,
          },
          {
            product_id: 29,
            product_name: "Sugar: solid",
            allocated_quantity: 0,
          },
        ],
        emission_total: 0,
        category_type: "basic",
      },
      {
        emission_category: "Emissions from waste",
        products: [
          {
            product_id: 1,
            product_name: "BC-specific refinery complexity throughput",
            allocated_quantity: 0,
          },
          {
            product_id: 29,
            product_name: "Sugar: solid",
            allocated_quantity: 0,
          },
        ],
        emission_total: 0,
        category_type: "basic",
      },
      {
        emission_category: "Emissions from wastewater",
        products: [
          {
            product_id: 1,
            product_name: "BC-specific refinery complexity throughput",
            allocated_quantity: 0,
          },
          {
            product_id: 29,
            product_name: "Sugar: solid",
            allocated_quantity: 0,
          },
        ],
        emission_total: 0,
        category_type: "basic",
      },
      {
        emission_category: "CO2 emissions from excluded woody biomass",
        products: [
          {
            product_id: 1,
            product_name: "BC-specific refinery complexity throughput",
            allocated_quantity: 0,
          },
          {
            product_id: 29,
            product_name: "Sugar: solid",
            allocated_quantity: 0,
          },
        ],
        emission_total: 0,
        category_type: "fuel_excluded",
      },
      {
        emission_category: "Other emissions from excluded biomass",
        products: [
          {
            product_id: 1,
            product_name: "BC-specific refinery complexity throughput",
            allocated_quantity: 0,
          },
          {
            product_id: 29,
            product_name: "Sugar: solid",
            allocated_quantity: 0,
          },
        ],
        emission_total: 0,
        category_type: "fuel_excluded",
      },
      {
        emission_category: "Emissions from excluded non-biomass",
        products: [
          {
            product_id: 1,
            product_name: "BC-specific refinery complexity throughput",
            allocated_quantity: 0,
          },
          {
            product_id: 29,
            product_name: "Sugar: solid",
            allocated_quantity: 0,
          },
        ],
        emission_total: 0,
        category_type: "fuel_excluded",
      },
    ],
    facility_total_emissions: 300.0,
    report_product_emission_allocation_totals: [
      {
        product_id: 1,
        product_name: "BC-specific refinery complexity throughput",
        allocated_quantity: 200.0,
      },
      {
        product_id: 29,
        product_name: "Sugar: solid",
        allocated_quantity: 100.0,
      },
    ],
    methodology: "Other",
    other_methodology_description: "test",
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

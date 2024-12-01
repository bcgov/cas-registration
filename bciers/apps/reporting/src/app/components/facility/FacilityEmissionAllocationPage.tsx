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
  const initialData = [
    {
      emission_category: "flaring",
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
      products: [
        {
          product_id: 1,
          product_name: "BC-specific refinery complexity throughput",
          product_emission: 0,
        },
      ],
      emission_total: 50,
    },
  ];

  return (
    <Form
      version_id={version_id}
      facility_id={facility_id}
      orderedActivities={orderedActivities}
      initialData={initialData}
    />
  );
}

import React from "react";
import {
  ReportEmissionAllocation,
  ReportProduct,
} from "@reporting/src/app/components/finalReview/reportTypes";
import { calculateEmissionData } from "@reporting/src/app/components/facility/calculateEmissionsData";
import { SectionReview } from "@reporting/src/app/components/finalReview/templates/SectionReview";

interface EmissionAllocationProps {
  data: ReportEmissionAllocation;
  isDeleted?: boolean;
}

export const transformEmissionAllocationData = (
  data: ReportEmissionAllocation,
) => ({
  allocation_methodology: data?.allocation_methodology || null,
  allocation_other_methodology_description:
    data?.allocation_other_methodology_description || null,
  basic_emission_allocation_data: (
    data?.report_product_emission_allocations || []
  )
    .filter((category) => category.category_type === "basic")
    .map(calculateEmissionData),
  fuel_excluded_emission_allocation_data: (
    data?.report_product_emission_allocations || []
  )
    .filter((category) => category.category_type === "fuel_excluded")
    .map(calculateEmissionData),
  total_emission_allocations: {
    facility_total_emissions:
      data?.facility_total_emissions?.toString() || null,
    products: data?.report_product_emission_allocation_totals || [],
  },
});

const addEmissionAllocationFields = (
  fields: any[],
  data: any[],
  dataKeyPrefix: string,
) => {
  data.forEach((category, categoryIndex) => {
    fields.push({ heading: category.emission_category_name });
    fields.push({
      label: "Total Emissions",
      key: `${dataKeyPrefix}.${categoryIndex}.emission_total`,
    });

    category.products.forEach(
      (product: ReportProduct, productIndex: number) => {
        fields.push({
          label: product.product_name,
          key: `${dataKeyPrefix}.${categoryIndex}.products.${productIndex}.allocated_quantity`,
          showSeparator: false,
        });
      },
    );

    fields.push({
      label: "Total Allocated",
      key: `${dataKeyPrefix}.${categoryIndex}.products_emission_allocation_sum`,
    });
  });
};

export const EmissionAllocationView: React.FC<EmissionAllocationProps> = ({
  data,
  isDeleted = false,
}) => {
  // Early return if data is undefined or null
  if (!data) {
    return null;
  }

  const transformedData = transformEmissionAllocationData(data);
  const fields: any[] = [
    { label: "Methodology", key: "allocation_methodology" },
  ];

  // Add conditional field only if allocation_other_methodology_description exists
  if (transformedData.allocation_other_methodology_description) {
    fields.push({
      label: "Other Methodology Description",
      key: "allocation_other_methodology_description",
    });
  }

  fields.push({
    heading:
      "Allocate the facility's total emissions, by emission category, among its regulated products in tCO2e:",
  });

  // Fields for basic emission allocation data
  addEmissionAllocationFields(
    fields,
    transformedData.basic_emission_allocation_data,
    "basic_emission_allocation_data",
  );

  // Fields for fuel excluded emission allocation data
  fields.push({
    heading:
      "Allocate the facility's total emissions, by emissions excluded by fuel type:",
  });

  addEmissionAllocationFields(
    fields,
    transformedData.fuel_excluded_emission_allocation_data,
    "fuel_excluded_emission_allocation_data",
  );
  // Fields for total emission allocations
  fields.push(
    {
      heading: "Totals in tCO2e",
    },
    {
      label: "Total emissions attributable for reporting",
      key: "total_emission_allocations.facility_total_emissions",
    },
  );

  if (transformedData.total_emission_allocations.products) {
    transformedData.total_emission_allocations.products.forEach(
      (product, productIndex) => {
        fields.push({
          label: product.product_name,
          key: `total_emission_allocations.products.${productIndex}.allocated_quantity`,
          showSeparator: false,
        });
      },
    );
  }

  return (
    <SectionReview
      title="Allocation of Emissions"
      data={transformedData}
      fields={fields}
      isDeleted={isDeleted}
    />
  );
};

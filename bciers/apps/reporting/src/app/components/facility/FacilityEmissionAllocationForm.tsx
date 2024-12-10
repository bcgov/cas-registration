"use client";

import { useSearchParams } from "next/navigation";
import serializeSearchParams from "@bciers/utils/src/serializeSearchParams";
import { actionHandler } from "@bciers/actions";
import safeJsonParse from "@bciers/utils/src/safeJsonParse";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { useEffect, useState, useCallback } from "react";
import {
  emissionAllocationSchema,
  emissionAllocationUiSchema,
} from "@reporting/src/data/jsonSchema/facility/facilityEmissionAllocation";
import { IChangeEvent } from "@rjsf/core";
import { multiStepHeaderSteps } from "@reporting/src/app/components/taskList/multiStepHeaderConfig";
import { getFacilitiesInformationTaskList } from "@reporting/src/app/components/taskList/2_facilitiesInformation";

// 📊 Interface for props passed to the component
interface Props {
  version_id: number;
  facility_id: string;
  orderedActivities: any;
  initialData: any;
}

interface Product {
  allocated_quantity: number;
  product_id: number;
  product_name: string;
}

interface EmissionAllocationData {
  emission_category: string;
  emission_total: number;
  category_type: string;
  products: Product[];
}

interface FormData {
  report_product_emission_allocations: EmissionAllocationData[];
  basic_emission_allocation_data: EmissionAllocationData[];
  fuel_excluded_emission_allocation_data: EmissionAllocationData[];
  report_product_emission_allocation_totals: Product[];
  facility_total_emissions: number;
  allocation_methodology: string;
  allocation_other_methodology_description: string;
}

// 🛠️ Function to calculate category products allocation sum and set total sum in products_emission_allocation_sum
const calculateEmissionData = (category: EmissionAllocationData) => {
  const sum = category.products.reduce(
    (total, product) =>
      total + (parseFloat(product.allocated_quantity.toString()) || 0),
    0,
  );

  const emissionTotal = Number(category.emission_total) || 1;
  const percentage = (sum / emissionTotal) * 100;

  return {
    ...category,
    products_emission_allocation_sum: `${percentage.toFixed(2)}%`,
    emission_total: category.emission_total.toString(),
  };
};

// 🛠️ Function to validate that emissions totals equal emissions allocations
const validateEmissions = (formData: FormData): boolean => {
  const combinedEmissionAllocationData = [
    ...formData.basic_emission_allocation_data,
    ...formData.fuel_excluded_emission_allocation_data,
  ];

  return combinedEmissionAllocationData.every((allocation) => {
    const sum = allocation.products.reduce(
      (total, product) =>
        total + (parseFloat(product.allocated_quantity.toString()) || 0),
      0,
    );

    const emissionTotal = parseFloat(allocation.emission_total.toString()) || 0;

    return parseFloat(sum.toFixed(4)) === parseFloat(emissionTotal.toFixed(4));
  });
};

export default function FacilityEmissionAllocationForm({
  version_id,
  facility_id,
  orderedActivities,
  initialData,
}: Props) {
  // Using the useState hook to initialize the form data with initialData values
  const [formData, setFormData] = useState<any>(() => ({
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
  }));

  // State for submit button disable
  const errorMismatch =
    "All emissions must be allocated to 100% before saving and continuing";
  const [error, setError] = useState<string | undefined>();
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(true);

  const searchParams = useSearchParams();
  const queryString = serializeSearchParams(searchParams);
  const saveAndContinueUrl = `/reports/${version_id}/additional-reporting-data${queryString}`;
  const backURL = `/reports/${version_id}/facilities/${facility_id}/production-data${queryString}`;

  // 📋 Get the task list elements for the form
  const taskListElements = getFacilitiesInformationTaskList(
    version_id,
    facility_id,
    orderedActivities,
    4,
  );

  // 🔄 Check for allocation mismatch on page load to prevent submit
  useEffect(() => {
    if (!validateEmissions(formData)) {
      setError(errorMismatch);
    }
    setSubmitButtonDisabled(!validateEmissions(formData));
  }, [formData]);

  // 🛠️ Handle changes to the form data, validates emissions, and updates the error state and submit button state.
  const handleChange = useCallback((e: IChangeEvent) => {
    const updatedFormData = e.formData;
    const updatedDataKeys = [
      "basic_emission_allocation_data",
      "fuel_excluded_emission_allocation_data",
    ];
    let errorMessage;

    // Initialize a map to store total allocated quantities by product_id
    const productAllocations: Record<string, number> = {};

    // Iterate through each category and recalculate allocated emissions data for the category
    updatedDataKeys.forEach((key) => {
      updatedFormData[key] = updatedFormData[key]
        .map((item: EmissionAllocationData) => ({
          ...item,
          products: item.products.map((product) => {
            const allocatedQuantity =
              parseFloat(product.allocated_quantity as any) || 0;

            // Accumulate the allocated quantity for this product_id
            productAllocations[product.product_id] =
              (productAllocations[product.product_id] || 0) + allocatedQuantity;

            return {
              ...product,
              allocated_quantity: String(allocatedQuantity),
            };
          }),
        }))
        .map(calculateEmissionData); // Recalculate emissions data
    });

    // Recompute total allocations for each product
    if (updatedFormData.total_emission_allocations?.products) {
      updatedFormData.total_emission_allocations.products =
        updatedFormData.total_emission_allocations.products.map(
          (product: { product_id: number }) => ({
            ...product,
            allocated_quantity: String(
              parseFloat(
                (productAllocations[product.product_id] || 0).toFixed(4),
              ),
            ),
          }),
        );
    }

    // Validate the updated form data and set an error message if validation fails
    if (!validateEmissions(updatedFormData)) {
      errorMessage = errorMismatch;
    }

    // Update the form data state
    setFormData(updatedFormData);

    setError(errorMessage);
    setSubmitButtonDisabled(!!errorMessage);
  }, []);

  // 🛠️ Handle form submit
  const handleSubmit = async () => {
    setSubmitButtonDisabled(true);
    // Transform formData to match the schema in structure
    const transformedPayload = {
      allocation_methodology: formData.allocation_methodology,
      allocation_other_methodology_description:
        formData.allocation_other_methodology_description,
      report_product_emission_allocations: [
        ...formData.basic_emission_allocation_data.map((item: any) => ({
          emission_total: item.emission_total,
          emission_category_name: item.emission_category,
          products: item.products.map((product: any) => ({
            report_product_id: product.report_product_id,
            product_name: product.product_name,
            allocated_quantity: parseFloat(product.allocated_quantity),
          })),
        })),
        ...formData.fuel_excluded_emission_allocation_data.map((item: any) => ({
          emission_total: item.emission_total,
          emission_category_name: item.emission_category,
          products: item.products.map((product: any) => ({
            report_product_id: product.report_product_id,
            product_name: product.product_name,
            allocated_quantity: parseFloat(product.allocated_quantity),
          })),
        })),
      ],
    };
    const method = "POST";
    const endpoint = `reporting/report-version/${version_id}/facilities/${facility_id}/allocate-emissions`;
    const pathToRevalidate = "reporting/reports";
    const payload = safeJsonParse(JSON.stringify(transformedPayload));
    const response = await actionHandler(endpoint, method, pathToRevalidate, {
      body: JSON.stringify(payload),
    });

    setSubmitButtonDisabled(false);
    if (response?.error) {
      setError(response.error);
    }
  };

  return (
    <MultiStepFormWithTaskList
      initialStep={1}
      steps={multiStepHeaderSteps}
      taskListElements={taskListElements}
      schema={emissionAllocationSchema}
      uiSchema={emissionAllocationUiSchema}
      formData={formData}
      submitButtonDisabled={submitButtonDisabled}
      baseUrl="#"
      cancelUrl="#"
      backUrl={backURL}
      onChange={handleChange}
      onSubmit={handleSubmit}
      error={error}
      continueUrl={saveAndContinueUrl}
      formContext={{
        facility_emission_data: formData.basic_emission_allocation_data.concat(
          formData.fuel_excluded_emission_allocation_data,
        ),
        total_emission_allocations: formData.total_emission_allocations,
      }}
    />
  );
}

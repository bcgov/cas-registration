"use client";

import { useRouter, useSearchParams } from "next/navigation";
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

interface FacilityEmissionAllocationFormData {
  report_product_emission_allocations: EmissionAllocationData[];
  basic_emission_allocation_data: EmissionAllocationData[];
  fuel_excluded_emission_allocation_data: EmissionAllocationData[];
  report_product_emission_allocation_totals: Product[];
  facility_total_emissions: number;
  methodology: string;
  other_methodology_description: string;
}

// 🛠️ Function to calculate product sum and formatted percentage
const calculateEmissionData = (category: EmissionAllocationData) => {
  const sum = category.products.reduce(
    (total, product) => total + (product.allocated_quantity || 0),
    0,
  );

  // Ensure emission_total is not zero
  const emissionTotal = category.emission_total || 1; // Default to 1 to avoid division by zero

  const percentage = (sum / emissionTotal) * 100;
  return {
    ...category,
    products_emission_allocation_sum: `${percentage.toFixed(2)}%`,
  };
};

//🛠️ Function to  validate emissions
const validateEmissions = (
  formData: FacilityEmissionAllocationFormData,
): boolean => {
  const combinedEmissionAllocationData = [
    ...formData.basic_emission_allocation_data,
    ...formData.fuel_excluded_emission_allocation_data,
  ];
  return combinedEmissionAllocationData.every((facility) => {
    const sum = facility.products.reduce(
      (total, product) => total + (product.allocated_quantity || 0),
      0,
    );
    return (
      parseFloat(sum.toFixed(4)) ===
      parseFloat(facility.emission_total.toFixed(4))
    );
  });
};

export default function FacilityEmissionAllocationForm({
  version_id,
  facility_id,
  orderedActivities,
  initialData,
}: Props) {
  const [formData, setFormData] = useState<any>(() => ({
    methodology: initialData.methodology,
    other_methodology_description: initialData.other_methodology_description,
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
  // 🛑 State for submit button disable
  const errorMismatch = "Mismatch in allocated emissions.";
  const [error, setError] = useState<string | undefined>();
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();
  const queryString = serializeSearchParams(searchParams);
  const saveAndContinueUrl = `/reports/${version_id}/facilities/${facility_id}/additional-reporting-data${queryString}`;

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

  // 🛠️ Handle form data changes
  const handleChange = useCallback((e: IChangeEvent) => {
    // Extract the updated form data from the event
    const updatedFormData = e.formData;

    // List of keys representing the emission allocation categories that need to be processed
    const updatedDataKeys = [
      "basic_emission_allocation_data",
      "fuel_excluded_emission_allocation_data",
    ];

    let errorMessage;

    // Initialize a map to store total allocated quantities by product_id
    const productAllocations: Record<string, number> = {};

    // Iterate over each emission allocation category to process the data
    updatedDataKeys.forEach((key) => {
      updatedFormData[key] = updatedFormData[key].map(
        (item: EmissionAllocationData) => ({
          ...item,
          // Ensure each product's allocated quantity is numeric
          products: item.products.map((product) => {
            const allocatedQuantity =
              parseFloat(product.allocated_quantity as any) || 0;

            // Accumulate the allocated quantity for this product_id
            productAllocations[product.product_id] =
              (productAllocations[product.product_id] || 0) + allocatedQuantity;

            return {
              ...product,
              allocated_quantity: allocatedQuantity, // Update allocated_quantity to a numeric value
            };
          }),
        }),
      );
    });

    // Update only the corresponding product_id in total_emission_allocations.products
    if (updatedFormData.total_emission_allocations?.products) {
      updatedFormData.total_emission_allocations.products =
        updatedFormData.total_emission_allocations.products.map((product) => ({
          ...product,
          // Use the accumulated quantity only for the matching product_id
          allocated_quantity: productAllocations[product.product_id] || 0,
        }));
    }

    // Validate the emissions to check for any discrepancies
    if (!validateEmissions(updatedFormData)) {
      errorMessage = errorMismatch; // Set the error message if validation fails
    }

    // Update the form data in the state
    setFormData(updatedFormData);

    // Update the error message in the state (if any)
    setError(errorMessage);

    // Enable or disable the submit button based on whether there is an error
    setSubmitButtonDisabled(!!errorMessage);
  }, []);

  // 🛠️ Handle form submit
  const handleSubmit = async () => {
    setSubmitButtonDisabled(true);
    const payload = safeJsonParse(JSON.stringify(formData));

    const response = await actionHandler(
      `reporting/report-version/${version_id}/allocate-emissions`,
      "POST",
      "reporting/reports",
      { body: JSON.stringify(payload) },
    );

    if (response?.error) {
      setError(response.error);
    } else {
      router.push(saveAndContinueUrl);
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
      onChange={handleChange}
      onSubmit={handleSubmit}
      error={error}
      formContext={{
        facility_emission_data: formData.basic_emission_allocation_data.concat(
          formData.fuel_excluded_emission_allocation_data,
        ),
        total_emission_allocations: formData.total_emission_allocations,
      }}
    />
  );
}

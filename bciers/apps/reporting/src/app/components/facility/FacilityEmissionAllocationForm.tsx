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

interface FormData {
  report_product_emission_allocations: EmissionAllocationData[];
  basic_emission_allocation_data: EmissionAllocationData[];
  fuel_excluded_emission_allocation_data: EmissionAllocationData[];
  report_product_emission_allocation_totals: Product[];
  facility_total_emissions: number;
  methodology: string;
  other_methodology_description: string;
}

// 🛠️ Function to calculate category products allocation sum and set total sum in products_emission_allocation_sum
const calculateEmissionData = (category: EmissionAllocationData) => {
  const sum = category.products.reduce(
    (total, product) => total + (product.allocated_quantity || 0),
    0,
  );

  // Convert emission_total to a number and ensure it's valid
  const emissionTotal = Number(category.emission_total) || 1;

  const percentage = (sum / emissionTotal) * 100;
  return {
    ...category,
    products_emission_allocation_sum: `${percentage.toFixed(2)}%`,
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

  // State for submit button disable
  const errorMismatch =
    "Please allocated emissions to match allocation totals.";
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
              allocated_quantity: parseFloat(allocatedQuantity.toFixed(4)),
            };
          }),
        }))
        .map(calculateEmissionData); // Recalculate emissions data
    });

    // Update the corresponding product_id in total_emission_allocations.products
    if (updatedFormData.total_emission_allocations?.products) {
      updatedFormData.total_emission_allocations.products =
        updatedFormData.total_emission_allocations.products.map(
          (product: { product_id: number }) => ({
            ...product,
            allocated_quantity: parseFloat(
              (productAllocations[product.product_id] || 0).toFixed(4),
            ),
          }),
        );
    }

    // Validate the updated form data and set an error message if validation fails
    if (!validateEmissions(updatedFormData)) {
      errorMessage = "Mismatch in allocated emissions.";
    }

    // Update the form data state
    setFormData(updatedFormData);

    setError(errorMessage);
    setSubmitButtonDisabled(!!errorMessage);
  }, []);

  // 🛠️ Handle form submit
  const handleSubmit = async () => {
    setSubmitButtonDisabled(true);
    const mockPayload = {
      methodology: "Other",
      other_methodology_description: "test",
      report_product_emission_allocations: [
        {
          emission_total: 300,
          emission_category: "Flaring emissions",
          category_type: "basic",
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
        },
        {
          emission_total: 400,
          emission_category: "Emissions from excluded non-biomass",
          category_type: "fuel_excluded",
          products: [
            {
              product_id: 1,
              product_name: "BC-specific refinery complexity throughput",
              allocated_quantity: 300,
            },
            {
              product_id: 29,
              product_name: "Sugar: solid",
              allocated_quantity: 100,
            },
          ],
        },
      ],
    };

    const payload = safeJsonParse(JSON.stringify(mockPayload));
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

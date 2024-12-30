"use client";

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
  report_product_id: number;
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
// Function that makes sure the percentage does not show 100 when it is not exactly 100
const handlePercentageNearHundred = (value: number) => {
  let res;
  if (value > 100.0 && value < 100.01) {
    res = 100.01;
  } else if (value < 100.0 && value > 99.99) {
    res = 99.99;
  } else {
    res = value;
  }

  return parseFloat(res.toFixed(4));
};

// 🛠️ Function to calculate category products allocation sum and set total sum in products_emission_allocation_sum
const calculateEmissionData = (category: EmissionAllocationData) => {
  const sum = category.products.reduce(
    (total, product) =>
      total + (parseFloat(product.allocated_quantity.toString()) || 0),
    0,
  );

  const emissionTotal = Number(category.emission_total) || 1;

  const percentage = handlePercentageNearHundred((sum / emissionTotal) * 100);

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
  const [errors, setErrors] = useState<string[] | undefined>();
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(true);

  // 🛸 Set up routing urls
  const backUrl = `/reports/${version_id}/facilities/${facility_id}/production-data`;
  const saveAndContinueUrl = `/reports/${version_id}/additional-reporting-data?facility_id=${facility_id}`;

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
      setErrors([errorMismatch]);
    }
    setSubmitButtonDisabled(!validateEmissions(formData));
  }, [formData]);

  // 🛠️ Handle changes to the form data, validates emissions, and updates the error state and submit button state.
  const handleChange = useCallback((e: IChangeEvent) => {
    const updatedFormData = e.formData;
    const BASIC_CATEGORY_DATA = "basic_emission_allocation_data";
    const EXCLUDED_CATEGORY_DATA = "fuel_excluded_emission_allocation_data";
    const updatedDataKeys = [BASIC_CATEGORY_DATA, EXCLUDED_CATEGORY_DATA];

    // Initialize a map to store total allocated quantities by report_product_id
    const productAllocations: Record<string, number> = {};

    // Iterate through each category and recalculate allocated emissions data for the category
    updatedDataKeys.forEach((key) => {
      updatedFormData[key] = updatedFormData[key]
        .map((item: EmissionAllocationData) => ({
          ...item,
          products: item.products.map((product) => {
            const allocatedQuantity =
              parseFloat(product.allocated_quantity as any) || 0;

            // Accumulate the reportable allocated quantity for this report_product_id
            if (key == BASIC_CATEGORY_DATA) {
              productAllocations[product.report_product_id] =
                (productAllocations[product.report_product_id] || 0) +
                allocatedQuantity;
            }
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
          (product: { report_product_id: number }) => ({
            ...product,
            allocated_quantity: String(
              parseFloat(
                (productAllocations[product.report_product_id] || 0).toFixed(4),
              ),
            ),
          }),
        );
    }

    // Validate the updated form data and set an error message if validation fails
    if (!validateEmissions(updatedFormData)) {
      setErrors([errorMismatch]);
      setSubmitButtonDisabled(true);
    } else {
      setSubmitButtonDisabled(false);
    }

    // Update the form data state
    setFormData(updatedFormData);
  }, []);

  // 🛠️ Handle form submit
  const handleSubmit = async () => {
    // Transform formData to match the schema in structure
    const transformedPayload = {
      allocation_methodology: formData.allocation_methodology,
      allocation_other_methodology_description:
        formData.allocation_other_methodology_description,
      report_product_emission_allocations: [
        ...formData.basic_emission_allocation_data.map((item: any) => ({
          emission_total: item.emission_total,
          emission_category_id: item.emission_category_id,
          products: item.products.map((product: any) => ({
            report_product_id: product.report_product_id,
            product_name: product.product_name,
            allocated_quantity: parseFloat(product.allocated_quantity),
          })),
        })),
        ...formData.fuel_excluded_emission_allocation_data.map((item: any) => ({
          emission_total: item.emission_total,
          emission_category_id: item.emission_category_id,
          products: item.products.map((product: any) => ({
            report_product_id: product.report_product_id,
            product_name: product.product_name,
            allocated_quantity: parseFloat(product.allocated_quantity),
          })),
        })),
      ],
    };

    const endpoint = `reporting/report-version/${version_id}/facilities/${facility_id}/allocate-emissions`;
    const payload = safeJsonParse(JSON.stringify(transformedPayload));

    const response = await actionHandler(endpoint, "POST", "", {
      body: JSON.stringify(payload),
    });

    if (response?.error) {
      setErrors(response.error);
      return false;
    }

    return true;
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
      backUrl={backUrl}
      onChange={handleChange}
      onSubmit={handleSubmit}
      continueUrl={saveAndContinueUrl}
      errors={errors}
      formContext={{
        facility_emission_data: formData.basic_emission_allocation_data.concat(
          formData.fuel_excluded_emission_allocation_data,
        ),
        total_emission_allocations: formData.total_emission_allocations,
      }}
    />
  );
}

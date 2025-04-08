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
import { EmissionAllocationData, Product } from "./types";
import { calculateEmissionData } from "./calculateEmissionsData";
import { NavigationInformation } from "../taskList/types";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { RJSFSchema } from "@rjsf/utils";

// 📊 Interface for props passed to the component
interface Props {
  version_id: number;
  facility_id: string;
  orderedActivities: any;
  initialData: any;
  navigationInformation: NavigationInformation;
  isPulpAndPaper: boolean;
  overlappingIndustrialProcessEmissions: number;
  taskListElements: TaskListElement[];
  operationType: string;
  facilityType: string;
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

const validateMethodology = (formData: FormData): boolean => {
  return (
    formData.allocation_methodology !== undefined &&
    formData.allocation_methodology !== ""
  );
};

const validateMethodologyOther = (formData: FormData): boolean => {
  return formData.allocation_methodology !== "Other"
    ? true
    : formData.allocation_other_methodology_description !== undefined &&
        formData.allocation_other_methodology_description !== "";
};

const validateFormData = (
  formData: FormData,
  isPulpAndPaper: boolean,
  overlappingIndustrialProcessEmissions: number,
) => {
  const errorMismatch =
    "All emissions must be allocated to 100% before saving and continuing";
  const errorMethodology =
    "A methodology must be selected before saving and continuing";
  const errorMethodologyOther =
    "A description must be provided for the selected methodology";

  const newErrors: string[] = [];

  if (!validateEmissions(formData)) {
    newErrors.push(errorMismatch);
  }
  if (!validateMethodology(formData)) {
    newErrors.push(errorMethodology);
  }
  if (!validateMethodologyOther(formData)) {
    newErrors.push(errorMethodologyOther);
  }
  if (isPulpAndPaper && overlappingIndustrialProcessEmissions > 0) {
    const industrialEmissionAllocations =
      formData?.basic_emission_allocation_data?.find(
        (allocation: EmissionAllocationData) =>
          allocation.emission_category_name === "Industrial process emissions",
      );
    const chemicalPulpAllocation =
      industrialEmissionAllocations?.products?.find(
        (p) => p.product_name === "Pulp and paper: chemical pulp",
      );
    if (!chemicalPulpAllocation)
      newErrors.push(
        "Missing Product: 'Pulp and paper: chemical pulp'. Please add the product on the operation review page",
      );
    else if (
      chemicalPulpAllocation.allocated_quantity -
        overlappingIndustrialProcessEmissions <
      0
    )
      newErrors.push(
        "Invalid allocation: Industrial Process quantity allocated to product 'Pulp and paper: chemical pulp' is too low",
      );
  }

  return newErrors;
};

export default function FacilityEmissionAllocationForm({
  version_id,
  facility_id,
  initialData,
  navigationInformation,
  isPulpAndPaper,
  overlappingIndustrialProcessEmissions,
  facilityType,
}: Props) {
  // If facility type is small or medium, add not applicable as an option
  const modifiedEmissionAllocationSchema = emissionAllocationSchema;
  if (
    ["Small Aggregate", "Medium Facility"].includes(facilityType) &&
    modifiedEmissionAllocationSchema.properties
  ) {
    const object = {
      type: "string",
      title: "Methodology",
      enum: ["Not Applicable", "OBPS Allocation Calculator", "Other"],
    };
    modifiedEmissionAllocationSchema.properties.allocation_methodology =
      object as RJSFSchema;
    // Set n/a as default since no product will be saved to draw methodology from
    initialData.allocation_methodology = "Not Applicable";
  }

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
  const [errors, setErrors] = useState<string[] | undefined>();
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(true);

  // 🔄 Check for allocation mismatch on page load to prevent submit
  useEffect(() => {
    const newErrors = validateFormData(
      formData,
      isPulpAndPaper,
      overlappingIndustrialProcessEmissions,
    );
    setErrors(newErrors);
    setSubmitButtonDisabled(newErrors.length > 0);
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
    const newErrors = validateFormData(
      updatedFormData,
      isPulpAndPaper,
      overlappingIndustrialProcessEmissions,
    );
    setErrors(newErrors);
    setSubmitButtonDisabled(newErrors.length > 0);

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
      setErrors([response.error]);
      return false;
    }

    return true;
  };

  return (
    <MultiStepFormWithTaskList
      initialStep={navigationInformation.headerStepIndex}
      steps={navigationInformation.headerSteps}
      taskListElements={navigationInformation.taskList}
      schema={modifiedEmissionAllocationSchema}
      uiSchema={emissionAllocationUiSchema}
      formData={formData}
      submitButtonDisabled={submitButtonDisabled}
      backUrl={navigationInformation.backUrl}
      saveButtonDisabled={submitButtonDisabled}
      onChange={handleChange}
      onSubmit={handleSubmit}
      continueUrl={navigationInformation.continueUrl}
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

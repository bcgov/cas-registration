"use client";
import { useRouter, useSearchParams } from "next/navigation";
import serializeSearchParams from "@bciers/utils/src/serializeSearchParams";
import { actionHandler } from "@bciers/actions";
import safeJsonParse from "@bciers/utils/src/safeJsonParse";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { useEffect, useState } from "react";
import {
  emissionAllocationSchema,
  emissionAllocationUiSchema,
} from "@reporting/src/data/jsonSchema/facility/facilityEmissionAllocation";
import { IChangeEvent } from "@rjsf/core";
import { multiStepHeaderSteps } from "@reporting/src/app/components/taskList/multiStepHeaderConfig";
import { getFacilitiesInformationTaskList } from "@reporting/src/app/components/taskList/2_facilitiesInformation";
import { init } from "@sentry/nextjs";

interface Props {
  version_id: number;
  facility_id: string;
  orderedActivities: any;
  initialData: any;
}
interface Product {
  product_emission: number;
  product_id: number;
  product_name: string;
}
interface EmissionAllocationData {
  emission_category: string;
  emission_total: number;
  category_type: string;
  products: Product[];
}
interface EmissionTotalData {
  total_emission: number;
  product_name: string;
}

interface FacilityEmissionAllocationFormData {
  report_product_emission_allocations: EmissionAllocationData[];
  basic_emission_data: EmissionAllocationData[];
  fuel_excluded_emission_data: EmissionAllocationData[];
  report_product_emission_totals: EmissionTotalData[];
  facility_total_emissions: number;
  methodology: string;
  other_methodology_description: string;
}

// 🛠️ Function to check if the emission allocations totals match the product sums
const allEmmissionsAllocated = (
  formData: FacilityEmissionAllocationFormData,
): boolean => {
  // Combine basic and fuel-excluded emission data into one array
  const combinedEmissionData = [
    ...formData.basic_emission_data,
    ...formData.fuel_excluded_emission_data,
  ];

  // Validate each emission data entry
  return combinedEmissionData.every((facility) => {
    // Calculate the sum of product_emission values
    const sum = facility.products.reduce((total: number, product: Product) => {
      return total + (product.product_emission || 0);
    }, 0);

    // Ensure sum is rounded to 4 decimals
    const formattedSum = parseFloat(sum.toFixed(4)); // Round to 4 decimals

    // Ensure emission_total is treated as a number, and round it to 4 decimals
    const formattedEmissionTotal = parseFloat(
      Number(facility.emission_total).toFixed(4),
    ); // Convert to number and round

    // Compare the formatted values
    return formattedSum === formattedEmissionTotal;
  });
};

export default function FacilityEmissionAllocationForm({
  version_id,
  facility_id,
  orderedActivities,
  initialData,
}: Props) {
  // Process initial emision data in report_product_emission_allocations
  const facilityEmissionData =
    initialData.report_product_emission_allocations.map((facility: any) => {
      if (facility.products && facility.emission_total) {
        // Calculate the sum of product_emission values
        const sum = facility.products.reduce(
          (total: number, product: any) =>
            total + (product.product_emission || 0),
          0,
        );

        // Calculate the percentage of the emission total
        const percentage = (sum / facility.emission_total) * 100;

        // Format the percentage
        const formattedPercentage =
          percentage === 0 ? "0.00%" : `${percentage.toFixed(2)}%`;

        return {
          ...facility,
          products_emission_sum: formattedPercentage, // Set the formatted percentage
        };
      }
      return facility;
    });
  // Filter for basic emissions for section "..regulated products in tCO2"
  const basicEmissionData = facilityEmissionData.filter(
    (facility: any) => facility.category_type === "basic",
  );
  // Filter for fuel_exclude emissions for section "...by emissions excluded by fuel type:"
  const fuelExcludedEmissionData = facilityEmissionData.filter(
    (facility: any) => facility.category_type === "fuel_excluded",
  );
  // Initialize form data
  const initialFormData = {
    methodology: initialData.methodology,
    other_methodology_description: initialData.other_methodology_description,
    basic_emission_data: basicEmissionData,
    fuel_excluded_emission_data: fuelExcludedEmissionData,
    total_emissions: {
      facility_total_emissions: initialData.facility_total_emissions,
      products: initialData.report_product_emission_totals,
    },
  };

  // Manage the formData state
  const [formData, setFormData] = useState<any>(initialFormData);
  // Manage the API error state
  const [error, setError] = useState<string | undefined>(undefined);
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(true);
  //Check on initial load when the form has data to manage save button state
  useEffect(() => {
    if (formData) {
      setSubmitButtonDisabled(!allEmmissionsAllocated(formData));
    }
  }, []);
  // Structure the save and continue navigation
  const searchParams = useSearchParams();
  const queryString = serializeSearchParams(searchParams);
  const router = useRouter();
  const saveAndContinueUrl = `/reports/${version_id}/facilities/${facility_id}/additional-reporting-data${queryString}`;
  // Get the facility task list for this step
  const taskListElements = getFacilitiesInformationTaskList(
    version_id,
    facility_id,
    orderedActivities,
    4,
  );

  // 🛠️ Function to handle form changes for conditional updates and rules
  const handleChange = (e: IChangeEvent) => {
    const updatedFormData = e.formData;
    let errorMessage: string | undefined = undefined;

    // Combine both emission data sources for processing
    const combinedDataKeys = [
      "basic_emission_data",
      "fuel_excluded_emission_data",
    ];

    combinedDataKeys.forEach((key) => {
      if (updatedFormData[key]) {
        updatedFormData[key] = updatedFormData[key].map((facility: any) => {
          if (facility.products && facility.emission_total) {
            // Calculate the sum of product_emission values
            const sum = facility.products.reduce(
              (total: number, product: any) =>
                total + (product.product_emission || 0),
              0,
            );

            // Calculate the percentage of the emission total
            const percentage = (sum / facility.emission_total) * 100;

            // Format the percentage
            const formattedPercentage =
              percentage === 0 ? "0.00%" : `${percentage.toFixed(2)}%`;

            // Validation: Check if the percentage exceeds 100%
            if (percentage > 100) {
              errorMessage = `The total product emissions for ${facility.emission_category} exceed 100% of the total emissions (${facility.emission_total}).`;
            }

            return {
              ...facility,
              products_emission_sum: formattedPercentage, // Set the formatted percentage
            };
          }
          return facility;
        });
      }
    });

    if (errorMessage) {
      setError(errorMessage); // Set error state
    } else {
      setError(undefined); // Clear error if no issues
    }

    setFormData(updatedFormData); // Update the state
    setSubmitButtonDisabled(!allEmmissionsAllocated(updatedFormData));
  };

  // 🛠️ Function to handle form submission
  const handleSubmit = async () => {
    // Validate all facilities before submission
    let errorMessage: string | undefined = undefined;

    const isInvalid = formData.facility_emission_data.some((facility: any) => {
      if (
        facility.products_emission_sum > parseFloat(facility.emission_total)
      ) {
        errorMessage = `The sum of product emissions for ${facility.emission_category} exceeds the total emissions (${facility.emission_total}).`;
        return true; // Stop further processing
      }
      return false;
    });

    if (isInvalid) {
      setError(errorMessage); // Set error and prevent submission
      return;
    }

    // Proceed with API submission
    setSubmitButtonDisabled(true);
    const endpoint = `reporting/report-version/${version_id}/allocate-emissions`;
    const method = "POST";
    const pathToRevalidate = "reporting/reports";
    const payload = safeJsonParse(JSON.stringify(formData));
    const response = await actionHandler(endpoint, method, pathToRevalidate, {
      body: JSON.stringify(payload),
    });

    if (response?.error) {
      setError(response.error);
      return;
    } else {
      setError(undefined);
    }

    router.push(saveAndContinueUrl);
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
      baseUrl={"#"}
      cancelUrl={"#"}
      onChange={handleChange}
      onSubmit={handleSubmit}
      error={error}
      formContext={{
        facility_emission_data: facilityEmissionData,
        total_emissions: initialFormData.total_emissions,
      }}
    />
  );
}

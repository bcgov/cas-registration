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

interface FacilityEmissionData {
  emission_category: string;
  emission_total: number;
  products: Product[];
}

interface FacilityEmissionAllocationFormData {
  facility_emission_data: FacilityEmissionData[];
}

// 🛠️ Function to check if the emission allocations totals match the product sums
const allEmmissionsAllocated = (
  formData: FacilityEmissionAllocationFormData,
): boolean => {
  // Loop through each emission data for facilities
  return formData.facility_emission_data.every((facility) => {
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
    const isMatch = formattedSum === formattedEmissionTotal;
    return isMatch;
  });
};
const FacilityEmissionAllocationForm: React.FC<Props> = ({
  version_id,
  facility_id,
  orderedActivities,
  initialData,
}) => {
  // Process initial data to calculate products_emission_sum
  const processedInitialData = initialData.map((facility: any) => {
    if (facility.products) {
      // Calculate the sum of product_emission values
      const sum = facility.products.reduce(
        (total: number, product: any) =>
          total + (product.product_emission || 0),
        0,
      );

      // Format the sum to "0.0000" if the sum is 0, or round it to 4 decimal places
      const formattedSum = sum === 0 ? "0.0000" : sum.toFixed(4);

      return {
        ...facility,
        products_emission_sum: formattedSum, // Set the formatted sum
      };
    }
    return facility;
  });
  // Initialize form data with processed initial data
  const initialFormData = {
    facility_emission_data: processedInitialData,
  };

  // Manage the formData state
  const [formData, setFormData] = useState<any>(initialFormData);
  // Manage the API error state
  const [error, setError] = useState<string | undefined>(undefined);
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(true);
  //Check on initial load when the form has data
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

    // Recalculates products_emission_sum and checks for validation
    if (updatedFormData.facility_emission_data) {
      updatedFormData.facility_emission_data =
        updatedFormData.facility_emission_data.map((facility: any) => {
          if (facility.products) {
            const sum = facility.products.reduce(
              (total: number, product: any) =>
                total + (product.product_emission || 0),
              0,
            );

            // Round sum to 4 decimal places, ensure it's a string for display
            const roundedSum = sum.toFixed(4); // Keep as a string with 4 decimals

            // Validation: Check if the sum exceeds emission_total
            if (parseFloat(roundedSum) > parseFloat(facility.emission_total)) {
              errorMessage = `The sum of product emissions for ${facility.emission_category} exceeds the total emissions (${facility.emission_total}).`;
            }

            return {
              ...facility,
              products_emission_sum: roundedSum, // Store as string
            };
          }
          return facility;
        });
    }

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
        facility_emission_data: formData.facility_emission_data,
      }}
    />
  );
};

export default FacilityEmissionAllocationForm;

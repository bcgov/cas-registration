"use client";

import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { useState } from "react";
import { RJSFSchema } from "@rjsf/utils";
import {
  emissionAllocationSchema,
  emissionAllocationUiSchema,
} from "@reporting/src/data/jsonSchema/facility/facilityEmissionAllocation";
import { IChangeEvent } from "@rjsf/core";
import { multiStepHeaderSteps } from "../taskList/multiStepHeaderConfig";

interface Props {
  version_id: number;
  facility_id: string;
  taskListElements: TaskListElement[];
  initialData: any;
}

const FacilityEmissionAllocationForm: React.FC<Props> = ({
  version_id,
  facility_id,
  taskListElements,
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
      return {
        ...facility,
        products_emission_sum: sum, // Set the sum
      };
    }
    return facility;
  });

  // Initialize form data with processed initial data
  const initialFormData = {
    facility_emission_data: processedInitialData,
  };

  const [formData, setFormData] = useState<any>(initialFormData);

  const handleChange = (e: IChangeEvent) => {
    const updatedFormData = e.formData;

    // Recalculate products_emission_sum dynamically
    if (updatedFormData.facility_emission_data) {
      updatedFormData.facility_emission_data =
        updatedFormData.facility_emission_data.map((facility: any) => {
          if (facility.products) {
            const sum = facility.products.reduce(
              (total: number, product: any) =>
                total + (product.product_emission || 0),
              0,
            );
            return {
              ...facility,
              products_emission_sum: sum,
            };
          }
          return facility;
        });
    }

    setFormData(updatedFormData); // Update the state
  };

  const handleSubmit = async () => {
    // Add submission logic if necessary
  };

  return (
    <MultiStepFormWithTaskList
      initialStep={1}
      steps={multiStepHeaderSteps}
      taskListElements={taskListElements}
      schema={emissionAllocationSchema}
      uiSchema={emissionAllocationUiSchema}
      formData={formData}
      baseUrl={"#"}
      cancelUrl={"#"}
      onSubmit={handleSubmit}
      onChange={handleChange}
      formContext={{
        facility_emission_data: formData.facility_emission_data,
      }}
    />
  );
};

export default FacilityEmissionAllocationForm;

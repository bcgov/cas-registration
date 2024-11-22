"use client";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { useState } from "react";
import { RJSFSchema } from "@rjsf/utils";
import {
  emissionAllocationSchema,
  emissionAllocationUiSchema,
} from "@reporting/src/data/jsonSchema/facility/facilityEmissionAllocation";
import { ProductData } from "@bciers/types/form/productionData";
import { postProductionData } from "@bciers/actions/api";
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
  const initialFormData = {
    facility_emission_data: initialData,
  };

  const [formData, setFormData] = useState<any>(initialFormData);

  const handleChange = () => {
    // Update the form state with the modified data
  };

  const handleSubmit = async () => {};

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
    />
  );
};

export default FacilityEmissionAllocationForm;

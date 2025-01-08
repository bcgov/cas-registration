"use client";

import React, { useState } from "react";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import {
  generateUpdatedSchema,
  nonAttributableEmissionUiSchema,
} from "@reporting/src/data/jsonSchema/nonAttributableEmissions/nonAttributableEmissions";
import { actionHandler } from "@bciers/actions";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { multiStepHeaderSteps } from "../../taskList/multiStepHeaderConfig";

interface ActivityData {
  id: number;
  activity: string;
  source_type: string;
  emission_category: number;
  gas_type: number[];
}

interface NonAttributableEmissionsProps {
  versionId: number;
  facilityId: string;
  emissionFormData: ActivityData[]; // Define emissionFormData as an array of ActivityData
  gasTypes: { id: number; chemical_formula: string }[];
  emissionCategories: { id: number; category_name: string }[];
  gasTypeMap: Record<number, string>;
  emissionCategoryMap: Record<number, string>;
  taskListElements: TaskListElement[];
}

export default function NonAttributableEmissionsForm({
  versionId,
  facilityId,
  emissionFormData,
  gasTypes,
  emissionCategories,
  gasTypeMap,
  emissionCategoryMap,
  taskListElements,
}: NonAttributableEmissionsProps & {
  gasTypeMap: Record<number, string>;
  emissionCategoryMap: Record<number, string>;
}) {
  const [errors, setErrors] = useState<string[]>();
  const [formData, setFormData] = useState(
    emissionFormData.length
      ? {
          activities: emissionFormData.map((item) => ({
            id: item.id,
            activity: item.activity,
            source_type: item.source_type,
            emission_category: emissionCategoryMap[item.emission_category],
            gas_type: item.gas_type.map((id) => gasTypeMap[id]),
          })),
          emissions_exceeded: true,
        }
      : {
          activities: [
            {
              activity: "",
              source_type: "",
              gas_type: [],
              emission_category: "",
            },
          ],
          emissions_exceeded: false,
        },
  );

  const saveAndContinueUrl = `/reports/${versionId}/facilities/${facilityId}/emission-summary`;
  const backUrl = `activities?step=-1`;

  const schema = generateUpdatedSchema(gasTypes, emissionCategories);

  const handleSubmit = async () => {
    const endpoint = `reporting/report-version/${versionId}/facilities/${facilityId}/non-attributable`;
    const response = await actionHandler(endpoint, "POST", endpoint, {
      body: JSON.stringify(formData),
    });

    if (response?.error) {
      setErrors([response.error]);
      return false;
    }

    setErrors(undefined);
    return true;
  };

  return (
    <MultiStepFormWithTaskList
      initialStep={1}
      steps={multiStepHeaderSteps}
      taskListElements={taskListElements}
      schema={schema}
      uiSchema={nonAttributableEmissionUiSchema}
      formData={formData}
      cancelUrl="#"
      onChange={(data) => setFormData(data.formData)}
      onSubmit={handleSubmit}
      backUrl={backUrl}
      continueUrl={saveAndContinueUrl}
      errors={errors}
    />
  );
}

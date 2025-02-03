"use client";

import React, { useState } from "react";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import {
  generateUpdatedSchema,
  nonAttributableEmissionUiSchema,
} from "@reporting/src/data/jsonSchema/nonAttributableEmissions/nonAttributableEmissions";
import { actionHandler } from "@bciers/actions";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { multiStepHeaderSteps } from "@reporting/src/app/components/taskList/multiStepHeaderConfig";

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
  return (
    <MultiStepFormWithTaskList
      initialStep={1}
      steps={multiStepHeaderSteps}
      taskListElements={taskListElements}
      schema={schema}
      uiSchema={}
      formData={{}}
      cancelUrl="#"
      onChange={() => console.log()}
      onSubmit={() => console.log()}
      backUrl={`backUrl`}
      continueUrl={`saveAndContinueUrl`}
      errors={}
    />
  );
}

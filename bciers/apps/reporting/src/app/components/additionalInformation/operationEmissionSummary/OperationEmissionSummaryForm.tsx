"use client";
import React from "react";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import {
  operationEmissionSummarySchema,
  emissionSummaryUiSchema,
} from "@reporting/src/data/jsonSchema/emissionSummary";
import { multiStepHeaderSteps } from "../../taskList/multiStepHeaderConfig";
import { EmissionSummaryFormData } from "@reporting/src/app/utils/emissionSummaryTypes";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";

interface Props {
  versionId: number;
  summaryFormData: EmissionSummaryFormData;
  taskListElements: TaskListElement[];
  isNewEntrant: boolean;
}

const OperationEmissionSummary: React.FC<Props> = ({
  versionId,
  summaryFormData,
  taskListElements,
  isNewEntrant,
}) => {
  const backUrl = isNewEntrant
    ? `/reports/${versionId}/new-entrant-information`
    : `/reports/${versionId}/additional-reporting-data`;
  const continueUrl = `/reports/${versionId}/compliance-summary`;
  const additionalReportingStepIndex = 2;

  return (
    <MultiStepFormWithTaskList
      taskListElements={taskListElements}
      schema={operationEmissionSummarySchema}
      uiSchema={emissionSummaryUiSchema}
      backUrl={backUrl}
      continueUrl={continueUrl}
      steps={multiStepHeaderSteps}
      initialStep={additionalReportingStepIndex}
      formData={summaryFormData}
      saveButtonDisabled={true}
    />
  );
};

export default OperationEmissionSummary;

"use client";
import React from "react";
import {
  operationEmissionSummarySchema,
  emissionSummaryUiSchema,
} from "@reporting/src/data/jsonSchema/emissionSummary";
import { multiStepHeaderSteps } from "../../taskList/multiStepHeaderConfig";
import { EmissionSummaryFormData } from "@reporting/src/app/utils/emissionSummaryTypes";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { NavigationInformation } from "../../taskList/types";

interface Props {
  summaryFormData: EmissionSummaryFormData;
  navigationInformation: NavigationInformation;
}

const OperationEmissionSummary: React.FC<Props> = ({
  summaryFormData,
  navigationInformation,
}) => {
  const additionalReportingStepIndex = 2;

  return (
    <MultiStepFormWithTaskList
      taskListElements={navigationInformation.taskList}
      schema={operationEmissionSummarySchema}
      uiSchema={emissionSummaryUiSchema}
      backUrl={navigationInformation.backUrl}
      continueUrl={navigationInformation.continueUrl}
      steps={multiStepHeaderSteps}
      initialStep={additionalReportingStepIndex}
      formData={summaryFormData}
      saveButtonDisabled={true}
    />
  );
};

export default OperationEmissionSummary;

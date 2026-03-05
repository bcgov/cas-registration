"use client";
import React from "react";
import {
  operationEmissionSummarySchema,
  emissionSummaryUiSchema,
} from "@reporting/src/data/jsonSchema/emissionSummary";
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
  return (
    <MultiStepFormWithTaskList
      taskListElements={navigationInformation.taskList}
      schema={operationEmissionSummarySchema}
      uiSchema={emissionSummaryUiSchema}
      backUrl={navigationInformation.backUrl}
      continueUrl={navigationInformation.continueUrl}
      steps={navigationInformation.headerSteps}
      initialStep={navigationInformation.headerStepIndex}
      formData={summaryFormData}
      saveButtonDisabled={true}
    />
  );
};

export default OperationEmissionSummary;

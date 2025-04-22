"use client";
import React from "react";
import { Box } from "@mui/material";
import MultiStepHeader from "@bciers/components/form/components/MultiStepHeader";
import FormBase from "@bciers/components/form/FormBase";
import ReportingTaskList from "@bciers/components/navigation/reportingTaskList/ReportingTaskList";
import ReportingStepButtons from "@bciers/components/form/components/ReportingStepButtons";

import { NavigationInformation } from "@reporting/src/app/components/taskList/types";
import { eioSchema, eioUiSchema } from "@reporting/src/data/jsonSchema/eio/eio";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { additionalReportingDataUiSchema } from "@reporting/src/data/jsonSchema/additionalReportingData/additionalReportingData";

interface Props {
  formData: any;
  navigationInformation: NavigationInformation;
}

const ElectricityInformationForm: React.FC<Props> = ({
  formData,
  navigationInformation,
}) => {
  return (
    <MultiStepFormWithTaskList
      initialStep={navigationInformation.headerStepIndex}
      steps={navigationInformation.headerSteps}
      taskListElements={navigationInformation.taskList}
      schema={eioSchema}
      uiSchema={eioUiSchema}
      formData={formData}
      backUrl={navigationInformation.backUrl}
      onChange={() => {
        console.log();
      }}
      onSubmit={() => console.log()}
      continueUrl={navigationInformation.continueUrl}
    />
  );
};

export default ElectricityInformationForm;

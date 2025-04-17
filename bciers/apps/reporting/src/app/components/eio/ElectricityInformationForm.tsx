"use client";
import React from "react";
import { Box } from "@mui/material";
import MultiStepHeader from "@bciers/components/form/components/MultiStepHeader";
import FormBase from "@bciers/components/form/FormBase";
import ReportingTaskList from "@bciers/components/navigation/reportingTaskList/ReportingTaskList";
import ReportingStepButtons from "@bciers/components/form/components/ReportingStepButtons";

import { NavigationInformation } from "@reporting/src/app/components/taskList/types";
import { eioSchema, eioUiSchema } from "@reporting/src/data/jsonSchema/eio/eio";

interface Props {
  formData: any;
  navigationInformation: NavigationInformation;
}

const ElectricityInformationForm: React.FC<Props> = ({
  formData,
  navigationInformation,
}) => {
  return (
    <Box sx={{ p: 3 }}>
      <div className="container mx-auto p-4" data-testid="compliance-summary">
        <MultiStepHeader
          stepIndex={navigationInformation.headerStepIndex}
          steps={navigationInformation.headerSteps}
        />
      </div>
      <div className="w-full flex">
        <ReportingTaskList elements={navigationInformation.taskList} />
        <div className="w-full md:max-w-[60%]">
          <FormBase
            schema={eioSchema}
            uiSchema={eioUiSchema}
            formData={formData}
          >
            <ReportingStepButtons
              backUrl={navigationInformation.backUrl}
              continueUrl={navigationInformation.continueUrl}
            />
          </FormBase>
        </div>
      </div>
    </Box>
  );
};

export default ElectricityInformationForm;

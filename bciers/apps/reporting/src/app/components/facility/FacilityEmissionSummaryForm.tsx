"use client";
import React from "react";
import { Box } from "@mui/material";
import MultiStepHeader from "@bciers/components/form/components/MultiStepHeader";
import FormBase from "@bciers/components/form/FormBase";
import ReportingTaskList from "@bciers/components/navigation/reportingTaskList/ReportingTaskList";
import {
  emissionSummaryUiSchema,
  facilityEmissionSummarySchema,
} from "@reporting/src/data/jsonSchema/emissionSummary";
import ReportingStepButtons from "@bciers/components/form/components/ReportingStepButtons";
import { EmissionSummaryFormData } from "@reporting/src/app/utils/emissionSummaryTypes";
import { NavigationInformation } from "../taskList/types";

interface Props {
  summaryFormData: EmissionSummaryFormData;
  navigationInformation: NavigationInformation;
}

const FacilityEmissionSummaryForm: React.FC<Props> = ({
  summaryFormData,
  navigationInformation,
}) => {
  return (
    <Box sx={{ p: 3 }}>
      <div
        className="container mx-auto p-4"
        data-testid="facility-emission-summary"
      >
        <MultiStepHeader
          stepIndex={navigationInformation.headerStepIndex}
          steps={navigationInformation.headerSteps}
        />
      </div>
      <div className="w-full flex">
        <ReportingTaskList elements={navigationInformation.taskList} />
        <div className="w-full md:max-w-[60%]">
          <FormBase
            schema={facilityEmissionSummarySchema}
            uiSchema={emissionSummaryUiSchema}
            formData={summaryFormData}
          >
            <ReportingStepButtons
              backUrl={navigationInformation.backUrl}
              continueUrl={navigationInformation.continueUrl}
              saveButtonDisabled={true}
              submitButtonDisabled={false}
            />
          </FormBase>
        </div>
      </div>
    </Box>
  );
};

export default FacilityEmissionSummaryForm;

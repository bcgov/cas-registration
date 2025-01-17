"use client";
import React from "react";
import { Box } from "@mui/material";
import MultiStepHeader from "@bciers/components/form/components/MultiStepHeader";
import FormBase from "@bciers/components/form/FormBase";
import ReportingTaskList from "@bciers/components/navigation/reportingTaskList/ReportingTaskList";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import {
  emissionSummaryUiSchema,
  facilityEmissionSummarySchema,
  EmissionSummaryFormData,
} from "@reporting/src/data/jsonSchema/emissionSummary";
import ReportingStepButtons from "@bciers/components/form/components/ReportingStepButtons";

interface Props {
  versionId: number;
  facilityId: string;
  summaryFormData: EmissionSummaryFormData;
  taskListElements: TaskListElement[];
}

const FacilityEmissionSummaryForm: React.FC<Props> = ({
  versionId,
  facilityId,
  summaryFormData,
  taskListElements,
}) => {
  const customStepNames = [
    "Operation Information",
    "Report Information",
    "Additional Information",
    "Compliance Summary",
    "Sign-off & Submit",
  ];

  const backRef = `/reports/${versionId}/facilities/${facilityId}/non-attributable`;
  const continueRef = `/reports/${versionId}/facilities/${facilityId}/production-data`;

  return (
    <Box sx={{ p: 3 }}>
      <div
        className="container mx-auto p-4"
        data-testid="facility-emission-summary"
      >
        <MultiStepHeader stepIndex={1} steps={customStepNames} />
      </div>
      <div className="w-full flex">
        <ReportingTaskList elements={taskListElements} />
        <div className="w-full md:max-w-[60%]">
          <FormBase
            schema={facilityEmissionSummarySchema}
            uiSchema={emissionSummaryUiSchema}
            formData={summaryFormData}
          >
            <ReportingStepButtons
              backUrl={backRef}
              continueUrl={continueRef}
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

"use client";
import React from "react";
import { Box } from "@mui/material";
import MultiStepHeader from "@bciers/components/form/components/MultiStepHeader";
import FormBase from "@bciers/components/form/FormBase";
import ReportingTaskList from "@bciers/components/navigation/reportingTaskList/ReportingTaskList";
import {
  createComplianceSummaryUiSchema,
  createComplianceSummarySchema,
} from "@reporting/src/data/jsonSchema/complianceSummary";
import ReportingStepButtons from "@bciers/components/form/components/ReportingStepButtons";
import { NavigationInformation } from "@reporting/src/app/components/taskList/types";
import { ComplianceSummaryFormData } from "@reporting/src/app/components/complianceSummary/types";

interface Props {
  summaryFormData: ComplianceSummaryFormData;
  navigationInformation: NavigationInformation;
}

const ComplianceSummaryForm: React.FC<Props> = ({
  summaryFormData,
  navigationInformation,
}) => {
  // Generate schemas based on reporting year and opted out decision
  const complianceSummarySchema = createComplianceSummarySchema(
    summaryFormData.reporting_year,
    summaryFormData.is_operation_opted_out,
  );

  const complianceSummaryUiSchema = createComplianceSummaryUiSchema(
    summaryFormData.reporting_year,
    summaryFormData.is_operation_opted_out,
  );

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
            schema={complianceSummarySchema}
            uiSchema={complianceSummaryUiSchema}
            formData={summaryFormData}
          >
            <ReportingStepButtons
              backUrl={navigationInformation.backUrl}
              continueUrl={navigationInformation.continueUrl}
              saveButtonDisabled={true}
            />
          </FormBase>
        </div>
      </div>
    </Box>
  );
};

export default ComplianceSummaryForm;

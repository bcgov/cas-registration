"use client";
import React from "react";
import { Box } from "@mui/material";
import MultiStepHeader from "@bciers/components/form/components/MultiStepHeader";
import FormBase from "@bciers/components/form/FormBase";
import ReportingTaskList from "@bciers/components/navigation/reportingTaskList/ReportingTaskList";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import {
  complianceSummaryUiSchema,
  complianceSummarySchema,
} from "@reporting/src/data/jsonSchema/complianceSummary";
import ReportingStepButtons from "@bciers/components/form/components/ReportingStepButtons";
import { multiStepHeaderSteps } from "@reporting/src/app/components/taskList/multiStepHeaderConfig";

interface Props {
  versionId: number;
  needsVerification: boolean;
  summaryFormData: {
    emissions_attributable_for_reporting: string;
    reporting_only_emissions: string;
    emissions_attributable_for_compliance: string;
    emissions_limit: string;
    excess_emissions: string;
    credited_emissions: string;
    regulatory_values: {
      reduction_factor: string;
      tightening_rate: string;
      initial_compliance_period: string;
      compliance_period: string;
    };
    products: {
      name: string;
      customUnit: string;
      annual_production: string;
      apr_dec_production: string;
      emission_intensity: string;
      allocated_industrial_process_emissions: string;
      allocated_compliance_emissions: string;
    }[];
  };
  taskListElements: TaskListElement[];
}

const ComplianceSummaryForm: React.FC<Props> = ({
  versionId,
  needsVerification,
  summaryFormData,
  taskListElements,
}) => {
  const backUrl = `/reports/${versionId}/additional-reporting-data`;
  const verificationUrl = `/reports/${versionId}/verification`;
  const finalReviewUrl = `/reports/${versionId}/final-review`;
  const continueUrl = needsVerification ? verificationUrl : finalReviewUrl;

  return (
    <Box sx={{ p: 3 }}>
      <div className="container mx-auto p-4" data-testid="compliance-summary">
        <MultiStepHeader stepIndex={3} steps={multiStepHeaderSteps} />
      </div>
      <div className="w-full flex">
        <ReportingTaskList elements={taskListElements} />
        <div className="w-full md:max-w-[60%]">
          <FormBase
            schema={complianceSummarySchema}
            uiSchema={complianceSummaryUiSchema}
            formData={summaryFormData}
          >
            <ReportingStepButtons
              backUrl={backUrl}
              continueUrl={continueUrl}
              saveButtonDisabled={true}
            />
          </FormBase>
        </div>
      </div>
    </Box>
  );
};

export default ComplianceSummaryForm;

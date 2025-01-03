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
import { multiStepHeaderSteps } from "../taskList/multiStepHeaderConfig";

interface Props {
  versionId: number;
  needsVerification: boolean;
  summaryFormData: {
    attributableForReporting: string;
    reportingOnlyEmission: string;
    emissionsLimit: string;
    excessEmissions: string;
    creditedEmissions: string;
    regulatoryValues: {
      reductionFactor: string;
      tighteningRate: string;
      initialCompliancePeriod: string;
      compliancePeriod: string;
    };
    products: {
      name: string;
      customUnit: string;
      annualProduction: string;
      emissionIntensity: string;
      allocatedIndustrialProcessEmissions: string;
      allocatedComplianceEmissions: string;
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

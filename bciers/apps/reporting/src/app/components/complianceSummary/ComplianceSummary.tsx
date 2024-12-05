"use client";
import React from "react";
import { Box, Button } from "@mui/material";
import MultiStepHeader from "@bciers/components/form/components/MultiStepHeader";
import FormBase from "@bciers/components/form/FormBase";
import ReportingTaskList from "@bciers/components/navigation/reportingTaskList/ReportingTaskList";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import {
  complianceSummaryUiSchema,
  complianceSummarySchema,
} from "@reporting/src/data/jsonSchema/complianceSummary";
import Link from "next/link";

interface Props {
  versionId: number;
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

const ComplianceSummary: React.FC<Props> = ({
  versionId,
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

  const backRef = `/reports/${versionId}/additional-reporting-data`;
  const continueRef = `/reports/${versionId}/sign-off`;

  return (
    <Box sx={{ p: 3 }}>
      <div className="container mx-auto p-4" data-testid="compliance-summary">
        <MultiStepHeader stepIndex={3} steps={customStepNames} />
      </div>
      <div className="w-full flex">
        <ReportingTaskList elements={taskListElements} />
        <div className="w-full md:max-w-[60%]">
          <FormBase
            schema={complianceSummarySchema}
            uiSchema={complianceSummaryUiSchema}
            formData={summaryFormData}
          >
            <Box display="flex" justifyContent="space-between" mt={3}>
              <Link href={backRef} passHref>
                <Button variant="outlined">Back</Button>
              </Link>
              <Link href={continueRef} passHref>
                <Button variant="contained" color="primary">
                  Continue
                </Button>
              </Link>
            </Box>
          </FormBase>
        </div>
      </div>
    </Box>
  );
};

export default ComplianceSummary;

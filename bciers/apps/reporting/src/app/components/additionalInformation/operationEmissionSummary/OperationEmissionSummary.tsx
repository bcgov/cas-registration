"use client";
import React from "react";
import { Box } from "@mui/material";
import MultiStepHeader from "@bciers/components/form/components/MultiStepHeader";
import FormBase from "@bciers/components/form/FormBase";
import ReportingTaskList from "@bciers/components/navigation/reportingTaskList/ReportingTaskList";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import {
  operationEmissionSummarySchema,
  operationEmissionSummaryUiSchema,
} from "@reporting/src/data/jsonSchema/operationEmissionSummary";
import ReportingStepButtons from "@bciers/components/form/components/ReportingStepButtons";

interface Props {
  versionId: number;
  summaryFormData: {
    attributableForReporting: string;
    attributableForReportingThreshold: string;
    reportingOnlyEmission: string;
    emissionCategories: {
      flaring: string;
      fugitive: string;
      industrialProcess: string;
      onSiteTransportation: string;
      stationaryCombustion: string;
      ventingUseful: string;
      ventingNonUseful: string;
      waste: string;
      wastewater: string;
    };
    fuelExcluded: {
      woodyBiomass: string;
      excludedBiomass: string;
      excludedNonBiomass: string;
    };
    otherExcluded: {
      lfoExcluded: string;
      fogExcluded: string; // To be handled once we implement a way to capture FOG emissions
    };
  };
  taskListElements: TaskListElement[];
}

const OperationEmissionSummary: React.FC<Props> = ({
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

  const backRef = `/reports/${versionId}/new-entrant-information`; // NEED TO CHECK THIS URL
  const continueRef = `/reports/${versionId}/compliance-summary`; // NEED TO CHECK THIS URL

  return (
    <Box sx={{ p: 3 }}>
      <div
        className="container mx-auto p-4"
        data-testid="operation-emission-summary" // NEED TO CHECK THIS VALUE
      >
        <MultiStepHeader stepIndex={1} steps={customStepNames} />
      </div>
      <div className="w-full flex">
        <ReportingTaskList elements={taskListElements} />
        <div className="w-full md:max-w-[60%]">
          <FormBase
            schema={operationEmissionSummarySchema}
            uiSchema={operationEmissionSummaryUiSchema}
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

export default OperationEmissionSummary;

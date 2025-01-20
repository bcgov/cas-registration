"use client";
import React from "react";
import { Box } from "@mui/material";
import MultiStepHeader from "@bciers/components/form/components/MultiStepHeader";
import FormBase from "@bciers/components/form/FormBase";
import ReportingTaskList from "@bciers/components/navigation/reportingTaskList/ReportingTaskList";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import {
  operationEmissionSummarySchema,
  emissionSummaryUiSchema,
} from "@reporting/src/data/jsonSchema/emissionSummary";
import ReportingStepButtons from "@bciers/components/form/components/ReportingStepButtons";
import { multiStepHeaderSteps } from "../../taskList/multiStepHeaderConfig";
import { EmissionSummaryFormData } from "@reporting/src/app/utils/emissionSummaryTypes";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";

interface Props {
  versionId: number;
  summaryFormData: EmissionSummaryFormData;
  taskListElements: TaskListElement[];
  isNewEntrant: boolean;
}

const OperationEmissionSummary: React.FC<Props> = ({
  versionId,
  summaryFormData,
  taskListElements,
  isNewEntrant,
}) => {
  const backRef = isNewEntrant
    ? `/reports/${versionId}/new-entrant-information`
    : `/reports/${versionId}/additional-reporting-data`;
  const continueRef = `/reports/${versionId}/compliance-summary`;
  const additionalReportingStepIndex = 2;

  const handleSubmit = async (): Promise<boolean> => {
    // This function does nothing and resolves to true
    return true;
  };

  return (
    <MultiStepFormWithTaskList
      initialStep={additionalReportingStepIndex}
      steps={multiStepHeaderSteps}
      taskListElements={taskListElements}
      backUrl={backRef}
      continueUrl={continueRef}
      formData={summaryFormData}
      schema={operationEmissionSummarySchema}
      uiSchema={emissionSummaryUiSchema}
      submitButtonDisabled={false}
      saveButtonDisabled={true}
      onSubmit={handleSubmit}
    />
    // <Box sx={{ p: 3 }}>
    //   <div
    //     className="container mx-auto p-4"
    //     data-testid="operation-emission-summary"
    //   >
    //     <MultiStepHeader
    //       stepIndex={additionalReportingStepIndex}
    //       steps={multiStepHeaderSteps}
    //     />
    //   </div>
    //   <div className="w-full flex">
    //     <ReportingTaskList elements={taskListElements} />
    //     <div className="w-full md:max-w-[60%]">
    //       <FormBase
    //         schema={operationEmissionSummarySchema}
    //         uiSchema={emissionSummaryUiSchema}
    //         formData={summaryFormData}
    //       >
    //         <ReportingStepButtons
    //           backUrl={backRef}
    //           continueUrl={continueRef}
    //           saveButtonDisabled={true}
    //           submitButtonDisabled={false}
    //         />
    //       </FormBase>
    //     </div>
    //   </div>
    // </Box>
  );
};

export default OperationEmissionSummary;

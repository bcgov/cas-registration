"use client";

import React from "react";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import ReportingTaskList from "@bciers/components/navigation/reportingTaskList/ReportingTaskList";
import { Box } from "@mui/material";
import MultiStepHeader from "@bciers/components/form/components/MultiStepHeader";
import ReportingStepButtons from "@bciers/components/form/components/ReportingStepButtons";
import FormAlerts from "@bciers/components/form/FormAlerts";
/**
 * Similar to the MultiStepFormWithTaskList,
 * except doesn't display a form, but can be used as a wrapper for any other page for a consistent look.
 */

interface Props {
  initialStep: number;
  steps: string[];
  taskListElements: TaskListElement[];
  onSubmit: () => void;
  children?: React.ReactNode;
  cancelUrl?: string;
  backUrl?: string;
  continueUrl: string;
  saveButtonText?: string;
  submittingButtonText?: string;
  errors?: string[];
  isSaving?: boolean;
  isRedirecting?: boolean;
  noFormSave?: () => void;
  noSaveButton?: boolean;
}

const MultiStepWrapperWithTaskList: React.FC<Props> = ({
  initialStep,
  steps,
  taskListElements,
  onSubmit,
  children,
  backUrl,
  continueUrl,
  submittingButtonText,
  errors,
  isSaving,
  isRedirecting,
  noFormSave,
  noSaveButton,
}) => {
  return (
    <Box sx={{ p: 3 }}>
      <div className="container mx-auto p-4" data-testid="facility-review">
        <MultiStepHeader stepIndex={initialStep} steps={steps} />
      </div>
      <div className="w-full flex">
        {/* Make the task list hidden on small screens and visible on medium and up */}
        <div className="hidden md:block">
          <ReportingTaskList elements={taskListElements} />
        </div>
        <div className="w-full">
          {children}
          <ReportingStepButtons
            backUrl={backUrl}
            continueUrl={continueUrl}
            buttonText={submittingButtonText}
            noFormSave={noFormSave}
            saveAndContinue={onSubmit}
            isRedirecting={isRedirecting}
            isSaving={isSaving}
            noSaveButton={noSaveButton}
          />

          {/* Render form alerts */}
          <FormAlerts errors={errors} />
        </div>
      </div>
    </Box>
  );
};

export default MultiStepWrapperWithTaskList;

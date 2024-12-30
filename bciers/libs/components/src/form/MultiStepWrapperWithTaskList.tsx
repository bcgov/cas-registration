"use client";

import React from "react";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import ReportingTaskList from "@bciers/components/navigation/reportingTaskList/ReportingTaskList";
import { Alert, Box } from "@mui/material";
import MultiStepHeader from "@bciers/components/form/components/MultiStepHeader";
import ReportingStepButtons from "./components/ReportingStepButtons";

/**
 * Similar to the MultiStepFormWithTaskList,
 * except doesn't display a for, but can be used as a wrapper for any other page for a consistent look.
 */

interface Props {
  initialStep: number;
  steps: string[];
  taskListElements: TaskListElement[];
  onSubmit: () => void;
  noFormSave: () => void;
  children?: React.ReactNode;
  cancelUrl?: string;
  backUrl?: string;
  continueUrl: string;
  saveButtonText?: string;
  submittingButtonText?: string;
  error?: string;
  isSaving?: boolean;
  isRedirecting?: boolean;
}

const MultiStepWrapperWithTaskList: React.FC<Props> = ({
  initialStep,
  steps,
  taskListElements,
  onSubmit,
  noFormSave,
  children,
  backUrl,
  continueUrl,
  submittingButtonText,
  error,
  isSaving,
  isRedirecting,
}) => {
  return (
    <Box sx={{ p: 3 }}>
      <div className="container mx-auto p-4" data-testid="facility-review">
        <MultiStepHeader stepIndex={initialStep} steps={steps} />
      </div>
      {error && (
        <div className="min-h-6">
          <Alert severity="error">{error}</Alert>
        </div>
      )}
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
          />
        </div>
      </div>
    </Box>
  );
};

export default MultiStepWrapperWithTaskList;

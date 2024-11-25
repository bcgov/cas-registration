"use client";

import React, { useState } from "react";
import MultiStepHeader from "./components/MultiStepHeader";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import ReportingTaskList from "@bciers/components/navigation/reportingTaskList/ReportingTaskList";
import { FormBase } from "@bciers/components/form/index";
import { RJSFSchema } from "@rjsf/utils";
import { Alert, Box, Button } from "@mui/material";
import ReportingStepButtons from "./components/ReportingStepButtons";

interface Props {
  initialStep: number;
  steps: string[];
  taskListElements: TaskListElement[];
  schema: RJSFSchema;
  uiSchema: RJSFSchema;
  formData: any;
  baseUrl?: string;
  cancelUrl?: string;
  backUrl: string;
  continueUrl: string;
  onSubmit: (data: any) => Promise<void>;
  buttonText?: string;
  onChange?: (data: any) => void;
  error?: any;
  saveButtonDisabled?: boolean;
}

const MultiStepFormWithTaskList: React.FC<Props> = ({
  initialStep,
  steps,
  taskListElements,
  schema,
  uiSchema,
  formData,
  backUrl,
  continueUrl,
  onSubmit,
  onChange,
  error,
  saveButtonDisabled,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFormSave = async (data: any) => {
    setIsSaving(true);
    try {
      await onSubmit(data);
      setIsSuccess(true);
    } catch {
      setIsSuccess(false);
    }
    setIsSaving(false);
  };

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
          <FormBase
            schema={schema}
            uiSchema={uiSchema}
            onSubmit={handleFormSave}
            formData={formData}
            onChange={onChange}
          >
            <ReportingStepButtons
              allowBackNavigation={true}
              backUrl={backUrl}
              continueUrl={continueUrl}
              isSaving={isSaving}
              isSuccess={isSuccess}
              saveButtonDisabled={saveButtonDisabled}
            />
            <div className="min-h-[48px] box-border mt-4">
              {error && <Alert severity="error">{error}</Alert>}
            </div>
          </FormBase>
        </div>
      </div>
    </Box>
  );
};

export default MultiStepFormWithTaskList;

"use client";

import React, { useEffect, useRef, useState } from "react";
import MultiStepHeader from "./components/MultiStepHeader";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import ReportingTaskList from "@bciers/components/navigation/reportingTaskList/ReportingTaskList";
import { FormBase } from "@bciers/components/form/index";
import { RJSFSchema } from "@rjsf/utils";
import FormContext from "@rjsf/core";
import { Alert, Box } from "@mui/material";
import ReportingStepButtons from "./components/ReportingStepButtons";
import { useRouter } from "next/navigation";

interface Props {
  initialStep: number;
  steps: string[];
  taskListElements: TaskListElement[];
  schema: RJSFSchema;
  uiSchema: RJSFSchema;
  formData: any;
  baseUrl?: string;
  cancelUrl?: string;
  backUrl?: string;
  continueUrl: string;
  onSubmit: (data: any) => Promise<any>;
  buttonText?: string;
  onChange?: (data: any) => void;
  error?: any;
  saveButtonDisabled?: boolean;
  submitButtonDisabled?: boolean;
  formContext?: { [key: string]: any }; // used in RJSF schema for access to form data in custom templates
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
  submitButtonDisabled,
  buttonText,
  formContext,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [canContinue, setCanContinue] = useState(false);
  const formRef = useRef<FormContext>(null);
  const router = useRouter();

  const handleFormSave = async (data: any) => {
    setIsSaving(true);
    try {
      const response = await onSubmit(data);
      let newCanContinue = true;
      // Check the response to proceed
      if (response !== undefined) {
        newCanContinue = !!response;
        setCanContinue(newCanContinue);
      }
      if (canContinue && newCanContinue) {
        setIsRedirecting(true);
        router.push(continueUrl);
      } else {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
        }, 3000);
      }
    } catch {
      setIsSuccess(false);
      setIsRedirecting(false);
    }
    setIsSaving(false);
  };

  const submitExternallyToContinue = () => {
    setCanContinue(true);
  }; // Only submit after canContinue is set so the submitHandler can read the boolean
  useEffect(() => {
    if (formRef.current && canContinue) {
      formRef.current.submit();
    }
  }, [canContinue]);

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
            formRef={formRef}
            schema={schema}
            uiSchema={uiSchema}
            onSubmit={handleFormSave}
            formData={formData}
            onChange={onChange}
            onError={() => setCanContinue(false)}
            formContext={formContext}
          >
            <ReportingStepButtons
              backUrl={backUrl}
              continueUrl={continueUrl}
              isSaving={isSaving}
              isSuccess={isSuccess}
              isRedirecting={isRedirecting}
              saveButtonDisabled={saveButtonDisabled}
              submitButtonDisabled={submitButtonDisabled}
              saveAndContinue={submitExternallyToContinue}
              buttonText={buttonText}
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

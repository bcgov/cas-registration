"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Alert } from "@mui/material";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FormBase from "./FormBase";
import MultiStepHeader from "./components/MultiStepHeader";
import MultiStepButtons from "./components/MultiStepButtons";
import { IChangeEvent } from "@rjsf/core";

interface MultiStepBaseProps {
  allowBackNavigation?: boolean;
  allowEdit?: boolean;
  baseUrl?: string;
  baseUrlParams?: string;
  cancelUrl: string;
  children?: React.ReactNode;
  error?: any;
  disabled?: boolean;
  formData?: any;
  onChange?: (e: IChangeEvent) => void;
  onSubmit: (e: IChangeEvent) => any;
  schema: RJSFSchema;
  step: number;
  steps: string[];
  setErrorReset?: (error: undefined) => void;
  submitButtonText?: string;
  uiSchema: UiSchema;
  submitButtonDisabled?: boolean;
}

// Modified MultiStepFormBase meant to facilitate more modularized Multi-step forms
// The main difference will be passing in a regular, non-nested schema as well as
// a number for the current step and a list of steps
const MultiStepBase = ({
  allowBackNavigation,
  allowEdit = false,
  baseUrl,
  baseUrlParams,
  cancelUrl,
  children,
  disabled,
  error,
  onChange,
  formData,
  onSubmit,
  schema,
  setErrorReset,
  step,
  steps,
  submitButtonText,
  uiSchema,
  submitButtonDisabled,
}: MultiStepBaseProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const router = useRouter();
  const isNotFinalStep = step !== steps?.length;

  const stepIndex = step - 1;

  // Set isSubmitting to true to disable submit buttons and prevent multiple form submissions
  const submitHandler = async (data: any) => {
    setIsSubmitting(true);
    const response = await onSubmit(data);
    // If there is an error, set isSubmitting to false to re-enable submit buttons
    // and allow user to attempt to re-submit the form
    if (response?.error) {
      setIsSubmitting(false);
    } else if (isNotFinalStep && baseUrl && baseUrlParams) {
      const nextStepUrl = `${baseUrl}/${step + 1}${
        baseUrlParams ? `?${baseUrlParams}` : ""
      }`;
      router.push(nextStepUrl);
    }
  };

  const isDisabled = (disabled && !isEditMode) || isSubmitting;

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  return (
    <>
      {allowEdit && (
        <div className="w-full flex justify-end mb-10">
          <Button
            variant="contained"
            color="primary"
            disabled={isEditMode}
            onClick={handleEditClick}
          >
            Edit information
          </Button>
        </div>
      )}
      <MultiStepHeader stepIndex={stepIndex} steps={steps} />
      <FormBase
        schema={schema}
        className="flex flex-col flex-grow"
        uiSchema={uiSchema}
        disabled={isDisabled}
        readonly={isDisabled}
        onChange={onChange}
        onSubmit={submitHandler}
        formData={formData}
        setErrorReset={setErrorReset}
      >
        <div className="flex flex-col flex-grow justify-end">
          {children}
          <div className="min-h-[48px] box-border">
            {error && <Alert severity="error">{error}</Alert>}
          </div>

          <MultiStepButtons
            disabled={isDisabled}
            isSubmitting={isSubmitting}
            stepIndex={stepIndex}
            steps={steps}
            cancelUrl={cancelUrl}
            allowBackNavigation={allowBackNavigation && steps.length > 1}
            baseUrl={baseUrl}
            submitButtonText={submitButtonText}
            submitButtonDisabled={submitButtonDisabled}
          />
        </div>
      </FormBase>
    </>
  );
};

export default MultiStepBase;

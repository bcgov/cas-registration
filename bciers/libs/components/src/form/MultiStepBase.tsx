"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@mui/material";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FormBase from "./FormBase";
import MultiStepHeader from "./components/MultiStepHeader";
import MultiStepButtons from "./components/MultiStepButtons";
import { IChangeEvent } from "@rjsf/core";
import {
  useValidationErrors,
  handleApiResponse,
  ValidationErrors,
  createGenericValidationError,
} from "@bciers/components/validationErrors";

interface MultiStepBaseProps {
  allowBackNavigation?: boolean;
  allowEdit?: boolean;
  baseUrl?: string;
  baseUrlParams?: string;
  cancelUrl: string;
  beforeForm?: React.ReactNode;
  children?: React.ReactNode;
  errors?: ValidationErrors | string;
  disabled?: boolean;
  formData?: any;
  formContext?: { [key: string]: any };
  onChange?: (e: IChangeEvent) => void;
  onSubmit: (e: IChangeEvent) => any;
  schema: RJSFSchema;
  step: number;
  steps: string[];
  setErrorReset?: (error: undefined) => void;
  submitButtonText?: string;
  uiSchema: UiSchema;
  submitButtonDisabled?: boolean;
  customValidate?: any;
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
  beforeForm,
  children,
  disabled,
  errors: parentErrors,
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
  customValidate,
  formContext,
}: MultiStepBaseProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const initialErrors =
    typeof parentErrors === "string"
      ? [createGenericValidationError(parentErrors)]
      : parentErrors;
  const { setErrors, renderedErrors } = useValidationErrors({
    initialErrors,
  });
  // Sync parentError prop changes to internal validation error state
  useEffect(() => {
    setErrors(initialErrors);
  }, [parentErrors]);
  const router = useRouter();
  const isNotFinalStep = step !== steps?.length;

  const stepIndex = step - 1;

  const submitHandler = async (data: any) => {
    setIsSubmitting(true);
    // Clear any old errors
    setErrors(undefined);

    const response = await onSubmit(data);
    const isSuccess = handleApiResponse(response, setErrors);
    if (!isSuccess) {
      setIsSubmitting(false);
      return;
    }

    if (isNotFinalStep && baseUrl) {
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
      {beforeForm}
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
        customValidate={customValidate}
        omitExtraData={true}
        formContext={formContext}
      >
        {children}
        <div className="flex flex-col flex-grow justify-end">
          <div className="min-h-[48px] box-border">{renderedErrors}</div>
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

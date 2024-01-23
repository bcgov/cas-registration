"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@mui/material";
import { RJSFSchema } from "@rjsf/utils";
import { Alert } from "@mui/material";
import FormBase from "./FormBase";
import MultiStepHeader from "./MultiStepHeader";
import MultiStepButtons from "./MultiStepButtons";

interface MultiStepFormProps {
  allowBackNavigation?: boolean;
  allowEdit?: boolean;
  baseUrl: string;
  cancelUrl: string;
  // Optional array to override the default header titles
  customStepNames?: string[];
  error?: any;
  disabled?: boolean;
  formData?: any;
  onSubmit: any;
  schema: any;
  setErrorReset?: (error: undefined) => void;
  showSubmissionStep?: boolean;
  uiSchema: any;
}

const MultiStepFormBase = ({
  allowBackNavigation,
  allowEdit = false,
  baseUrl,
  cancelUrl,
  customStepNames,
  disabled,
  error,
  formData,
  onSubmit,
  schema,
  setErrorReset,
  showSubmissionStep,
  uiSchema,
}: MultiStepFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const params = useParams();
  const formSection = parseInt(params?.formSection as string);
  const formSectionIndex = formSection - 1;

  const formSectionList = Object.keys(schema.properties as any);
  const mapSectionTitles = formSectionList.map(
    (section) => schema.properties[section].title,
  );

  const formSectionTitles = showSubmissionStep
    ? [...mapSectionTitles, "Submission"]
    : mapSectionTitles;

  // Set isSubmitting to true to disable submit buttons and prevent multiple form submissions
  const submitHandler = async (data: any) => {
    setIsSubmitting(true);
    const response = await onSubmit(data);

    // If there is an error, set isSubmitting to false to re-enable submit buttons
    // and allow user to attempt to re-submit the form
    if (response?.error) {
      setIsSubmitting(false);
    }
  };

  const isDisabled = (disabled && !isEditMode) || isSubmitting;

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const isCustomStepNames = customStepNames && customStepNames.length > 0;

  if (
    isCustomStepNames &&
    formSectionTitles.length !== customStepNames.length
  ) {
    throw new Error(
      "The number of custom header titles must match the number of form sections",
    );
  }

  return (
    <>
      {allowEdit && (
        <div className="w-full flex justify-end">
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
      <MultiStepHeader
        step={formSectionIndex}
        steps={isCustomStepNames ? customStepNames : formSectionTitles}
      />
      <FormBase
        className="[&>div>fieldset]:min-h-[40vh]"
        schema={
          schema.properties[formSectionList[formSectionIndex]] as RJSFSchema
        }
        uiSchema={uiSchema}
        disabled={isDisabled}
        readonly={isDisabled}
        onSubmit={submitHandler}
        formData={formData}
        setErrorReset={setErrorReset}
      >
        {error && <Alert severity="error">{error}</Alert>}
        <MultiStepButtons
          disabled={isDisabled}
          isSubmitting={isSubmitting}
          step={formSectionIndex}
          steps={formSectionList}
          baseUrl={baseUrl}
          cancelUrl={cancelUrl}
          allowBackNavigation={allowBackNavigation}
        />
      </FormBase>
    </>
  );
};

export default MultiStepFormBase;

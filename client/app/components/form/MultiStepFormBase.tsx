"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { RJSFSchema } from "@rjsf/utils";
import { Alert } from "@mui/material";
import FormBase from "./FormBase";
import MultiStepHeader from "./MultiStepHeader";
import MultiStepButtons from "./MultiStepButtons";

interface MultiStepFormProps {
  baseUrl: string;
  cancelUrl: string;
  error?: any;
  disabled?: boolean;
  formData?: any;
  onSubmit: any;
  schema: any;
  setErrorReset?: (error: undefined) => void;
  showSubmissionStep?: boolean;
  allowBackNavigation?: boolean;
  uiSchema: any;
}

const MultiStepFormBase = ({
  baseUrl,
  cancelUrl,
  disabled,
  error,
  formData,
  onSubmit,
  schema,
  setErrorReset,
  showSubmissionStep,
  allowBackNavigation,
  uiSchema,
}: MultiStepFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const params = useParams();
  const formSection = parseInt(params?.formSection as string) - 1;

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

  const isDisabled = disabled || isSubmitting;

  return (
    <>
      <MultiStepHeader step={formSection} steps={formSectionTitles} />
      <FormBase
        className="[&>div>fieldset]:min-h-[40vh]"
        schema={schema.properties[formSectionList[formSection]] as RJSFSchema}
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
          step={formSection}
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

"use client";

import { actionHandler } from "@bciers/actions";
import { useState } from "react";
import MultiStepBase from "@bciers/components/form/MultiStepBase";
import { submissionUiSchema } from "apps/registration/app/data/jsonSchema/operationRegistration/submission";
import {
  RegistrationSubmissionFormData,
  OperationRegistrationFormProps,
} from "apps/registration/app/components/operations/registration/types";
import { IChangeEvent } from "@rjsf/core";
import SnackBar from "@bciers/components/form/components/SnackBar";
import Success from "apps/registration/app/components/operations/registration/Success";

// Check if all checkboxes are checked
const allChecked = (formData: RegistrationSubmissionFormData) => {
  return Object.values(formData).every((value) => value);
};

const RegistrationSubmissionForm = ({
  operation,
  schema,
  step,
  steps,
}: OperationRegistrationFormProps) => {
  const [formState, setFormState] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(true);
  const [error, setError] = useState("");
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);

  const handleChange = (e: IChangeEvent) => {
    setFormState(e.formData);
    setSubmitButtonDisabled(!allChecked(e.formData));
  };

  const handleSubmit = async (e: IChangeEvent) => {
    setSubmitButtonDisabled(true);
    const response = await actionHandler(
      `registration/v2/operations/${operation}/registration/submission`,
      "PATCH",
      "",
      {
        body: JSON.stringify({
          ...e.formData,
        }),
      },
    );
    if (response?.error) {
      setError(response.error);
      setSubmitButtonDisabled(false);
      return { error: response.error };
    }
    // Temporary snackbar message - will be replaced with a redirect
    setIsSnackbarOpen(true);
    setIsSubmitted(true);
  };

  return (
    <>
      {isSubmitted ? (
        <Success step={step} steps={steps} />
      ) : (
        <>
          <MultiStepBase
            allowBackNavigation
            baseUrl={`/register-an-operation/${operation}`}
            baseUrlParams="title=Placeholder+Title"
            cancelUrl="/"
            formData={formState}
            onSubmit={handleSubmit}
            error={error}
            schema={schema}
            step={step}
            steps={steps}
            uiSchema={submissionUiSchema}
            onChange={handleChange}
            submitButtonDisabled={submitButtonDisabled}
          />
          <SnackBar
            isSnackbarOpen={isSnackbarOpen}
            message="Operation Registration Submitted"
            setIsSnackbarOpen={setIsSnackbarOpen}
          />
        </>
      )}
    </>
  );
};

export default RegistrationSubmissionForm;

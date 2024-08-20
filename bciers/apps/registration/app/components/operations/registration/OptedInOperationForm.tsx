"use client";

import MultiStepBase from "@bciers/components/form/MultiStepBase";
import { optedInOperationUiSchema } from "apps/registration/app/data/jsonSchema/operationRegistration/optedInOperation";
import {
  OptedInOperationFormData,
  OperationRegistrationFormProps,
} from "apps/registration/app/components/operations/registration/types";
import { useEffect, useState } from "react";
import { actionHandler } from "@bciers/actions";
import { IChangeEvent } from "@rjsf/core";

interface OptedInOperationFormProps extends OperationRegistrationFormProps {
  formData: OptedInOperationFormData;
}
// Check if all questions are answered
const allQuestionsAnswered = (formData: OptedInOperationFormData) => {
  return Object.values(formData).every((value) => value !== null);
};

const OptedInOperationForm = ({
  operation,
  schema,
  step,
  steps,
  formData,
}: OptedInOperationFormProps) => {
  const [formState, setFormState] = useState(formData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(true);
  const [error, setError] = useState("");

  //To run the check on initial load when the form already has data
  useEffect(() => {
    setSubmitButtonDisabled(!allQuestionsAnswered(formData));
  }, []);

  const handleChange = (e: IChangeEvent) => {
    setFormState(e.formData);
    setSubmitButtonDisabled(!allQuestionsAnswered(e.formData));
  };

  const handleSubmit = async (e: IChangeEvent) => {
    setIsSubmitting(true);
    setSubmitButtonDisabled(true);
    const response = await actionHandler(
      `registration/v2/operations/${operation}/registration/opted-in-operation-detail`,
      "PUT",
      `/register-an-operation/${operation}`, // Removing this line will cause the form to show the existing data(not consistent)
      {
        body: JSON.stringify({
          ...e.formData,
        }),
      },
    );
    if (response?.error) {
      setError(response.error);
      setIsSubmitting(false);
      setSubmitButtonDisabled(false);
      return { error: response.error };
    }
  };
  return (
    <MultiStepBase
      allowBackNavigation
      baseUrl={`/register-an-operation/${operation}`}
      baseUrlParams="title=Placeholder+Title"
      cancelUrl="/"
      error={error}
      formData={formState}
      onChange={handleChange}
      onSubmit={handleSubmit}
      schema={
        isSubmitting // A workaround to not show the read-only schema when submitting
          ? {
              title: "Submitting...",
              type: "object",
            }
          : schema
      }
      step={step}
      steps={steps}
      uiSchema={optedInOperationUiSchema}
      submitButtonDisabled={submitButtonDisabled}
    />
  );
};

export default OptedInOperationForm;

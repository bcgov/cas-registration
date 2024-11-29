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
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(true);

  //To run the check on initial load when the form already has data
  useEffect(() => {
    if (formData) {
      setSubmitButtonDisabled(!allQuestionsAnswered(formData));
    }
  }, []);

  const handleChange = (e: IChangeEvent) => {
    setFormState(e.formData);
    setSubmitButtonDisabled(!allQuestionsAnswered(e.formData));
  };

  const handleSubmit = async (e: IChangeEvent) => {
    setSubmitButtonDisabled(true);
    const response = await actionHandler(
      `registration/operations/${operation}/registration/opted-in-operation-detail`,
      "PUT",
      `/register-an-operation/${operation}`, // Removing this line will cause the form to show the existing data(not consistent)
      {
        body: JSON.stringify({
          ...e.formData,
        }),
      },
    );

    // errors are handled in MultiStepBase
    return response;
  };
  return (
    <MultiStepBase
      allowBackNavigation
      baseUrl={`/register-an-operation/${operation}`}
      cancelUrl="/"
      formData={formState}
      onChange={handleChange}
      onSubmit={handleSubmit}
      schema={schema}
      step={step}
      steps={steps}
      uiSchema={optedInOperationUiSchema}
      submitButtonDisabled={submitButtonDisabled}
    />
  );
};

export default OptedInOperationForm;

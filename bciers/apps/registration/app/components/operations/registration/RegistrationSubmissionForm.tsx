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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(true);

  const handleChange = (e: IChangeEvent) => {
    setFormState(e.formData);
    setSubmitButtonDisabled(!allChecked(e.formData));
  };

  const handleSubmit = async (e: IChangeEvent) => {
    setIsSubmitting(true);
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
    // errors are handled in MultiStepBase
    return response;
  };

  return (
    <>
      <MultiStepBase
        allowBackNavigation
        baseUrl={`/register-an-operation/${operation}`}
        cancelUrl="/"
        formData={formState}
        onSubmit={handleSubmit}
        schema={
          isSubmitting
            ? {
                title: "Submitting...",
                type: "object",
              }
            : schema
        }
        step={step}
        steps={steps}
        uiSchema={submissionUiSchema}
        onChange={handleChange}
        submitButtonDisabled={submitButtonDisabled}
        successComponent=<Success step={step} steps={steps} />
      />
    </>
  );
};

export default RegistrationSubmissionForm;

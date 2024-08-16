"use client";

import { useState } from "react";
import { actionHandler } from "@bciers/actions";
import { IChangeEvent } from "@rjsf/core";
import MultiStepBase from "@bciers/components/form/MultiStepBase";
import { newEntrantOperationUiSchema } from "apps/registration/app/data/jsonSchema/operationRegistration/newEntrantOperation";
import {
  NewEntrantOperationFormData,
  OperationRegistrationFormProps,
} from "apps/registration/app/components/operations/registration/types";

interface NewEntrantOperationFormProps extends OperationRegistrationFormProps {
  formData: NewEntrantOperationFormData;
}

const NewEntrantOperationForm = ({
  formData,
  operation,
  schema,
  step,
  steps,
}: NewEntrantOperationFormProps) => {
  const [error, setError] = useState(undefined);
  const handleSubmit = async (e: IChangeEvent) => {
    const method = "PUT";
    const endpoint = "registration/operations/statutory-declarations";
    const body = {
      operation_id: operation,
      statutory_declaration: e.formData.statutory_declaration,
    };
    const response = await actionHandler(endpoint, method, "", {
      body: JSON.stringify(body),
    });

    if (response.error) {
      setError(response.error);
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
      formData={formData}
      onSubmit={handleSubmit}
      schema={schema}
      step={step}
      steps={steps}
      uiSchema={newEntrantOperationUiSchema}
    />
  );
};

export default NewEntrantOperationForm;

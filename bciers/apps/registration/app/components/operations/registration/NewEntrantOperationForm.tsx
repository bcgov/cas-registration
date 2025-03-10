"use client";

import { actionHandler } from "@bciers/actions";
import { IChangeEvent } from "@rjsf/core";
import MultiStepBase from "@bciers/components/form/MultiStepBase";
import { newEntrantOperationUiSchema } from "apps/registration/app/data/jsonSchema/operationRegistration/newEntrantOperation";
import {
  NewEntrantOperationFormData,
  OperationRegistrationFormProps,
} from "apps/registration/app/components/operations/registration/types";
import { convertRjsfFormData } from "./OperationInformationForm";

interface NewEntrantOperationFormProps extends OperationRegistrationFormProps {
  formData: NewEntrantOperationFormData | {};
}

const NewEntrantOperationForm = ({
  formData,
  operation,
  schema,
  step,
  steps,
}: NewEntrantOperationFormProps) => {
  const baseUrl = `/register-an-operation/${operation}`;
  const handleSubmit = async (e: IChangeEvent) => {
    const endpoint = `registration/operations/${operation}/registration/new-entrant-application`;
    // errors are handled in MultiStepBase
    const response = await actionHandler(endpoint, "POST", `${baseUrl}`, {
      body: convertRjsfFormData(e.formData),
    });
    return response;
  };

  return (
    <MultiStepBase
      allowBackNavigation
      baseUrl={baseUrl}
      cancelUrl="/"
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

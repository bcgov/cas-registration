"use client";

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
  return (
    <MultiStepBase
      baseUrl={`/operation/${operation}`}
      baseUrlParams="title=Placeholder+Title"
      cancelUrl="/"
      formData={formData}
      onSubmit={() => {}}
      schema={schema}
      step={step}
      steps={steps}
      uiSchema={newEntrantOperationUiSchema}
    />
  );
};

export default NewEntrantOperationForm;

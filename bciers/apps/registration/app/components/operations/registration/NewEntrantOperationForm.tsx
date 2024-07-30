"use client";

import FormBase from "@bciers/components/form/FormBase";
import MultiStepHeader from "@bciers/components/form/components/MultiStepHeader";
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  operation,
  schema,
  step,
  steps,
}: NewEntrantOperationFormProps) => {
  return (
    <>
      <MultiStepHeader step={step} steps={steps} />
      <FormBase
        formData={formData}
        schema={schema}
        uiSchema={newEntrantOperationUiSchema}
      />
    </>
  );
};

export default NewEntrantOperationForm;

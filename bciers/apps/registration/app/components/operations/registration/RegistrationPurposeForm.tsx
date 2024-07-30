"use client";

import FormBase from "@bciers/components/form/FormBase";
import MultiStepHeader from "@bciers/components/form/components/MultiStepHeader";
import { registrationPurposeUiSchema } from "apps/registration/app/data/jsonSchema/operationRegistration/registrationPurpose";
import {
  RegistrationPurposeFormData,
  OperationRegistrationFormProps,
} from "apps/registration/app/components/operations/registration/types";

interface RegistrationPurposeFormProps extends OperationRegistrationFormProps {
  formData: RegistrationPurposeFormData;
}

const RegistrationPurposeForm = ({
  formData,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  operation,
  schema,
  step,
  steps,
}: RegistrationPurposeFormProps) => {
  return (
    <>
      <MultiStepHeader step={step} steps={steps} />
      <FormBase
        formData={formData}
        schema={schema}
        uiSchema={registrationPurposeUiSchema}
      />
    </>
  );
};

export default RegistrationPurposeForm;

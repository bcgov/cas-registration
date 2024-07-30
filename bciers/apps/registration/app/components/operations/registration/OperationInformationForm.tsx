"use client";

import FormBase from "@bciers/components/form/FormBase";
import MultiStepHeader from "@bciers/components/form/components/MultiStepHeader";
import { operationInformationUiSchema } from "apps/registration/app/data/jsonSchema/operationRegistration/operationInformation";
import {
  OperationInformationFormData,
  OperationRegistrationFormProps,
} from "apps/registration/app/components/operations/registration/types";

interface OperationInformationFormProps extends OperationRegistrationFormProps {
  formData: OperationInformationFormData;
}

const OperationInformationForm = ({
  formData,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  operation,
  schema,
  step,
  steps,
}: OperationInformationFormProps) => {
  return (
    <>
      <MultiStepHeader step={step} steps={steps} />
      <FormBase
        formData={formData}
        schema={schema}
        uiSchema={operationInformationUiSchema}
      />
    </>
  );
};

export default OperationInformationForm;

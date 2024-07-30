"use client";

import FormBase from "@bciers/components/form/FormBase";
import MultiStepHeader from "@bciers/components/form/components/MultiStepHeader";
import { operationRepresentativeUiSchema } from "apps/registration/app/data/jsonSchema/operationRegistration/operationRepresentative";
import {
  OperationRepresentativeFormData,
  OperationRegistrationFormProps,
} from "apps/registration/app/components/operations/registration/types";

interface OperationRepresentativeFormProps
  extends OperationRegistrationFormProps {
  formData: OperationRepresentativeFormData;
}

const OperationRepresentativeForm = ({
  formData,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  operation,
  schema,
  step,
  steps,
}: OperationRepresentativeFormProps) => {
  return (
    <>
      <MultiStepHeader step={step} steps={steps} />
      <FormBase
        formData={formData}
        schema={schema}
        uiSchema={operationRepresentativeUiSchema}
      />
    </>
  );
};

export default OperationRepresentativeForm;

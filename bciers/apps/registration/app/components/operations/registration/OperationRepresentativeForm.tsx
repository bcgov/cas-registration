"use client";

import MultiStepBase from "@bciers/components/form/MultiStepBase";
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
  operation,
  schema,
  step,
  steps,
}: OperationRepresentativeFormProps) => {
  return (
    <MultiStepBase
      allowBackNavigation
      baseUrl={`/operation/${operation}`}
      baseUrlParams="title=Placeholder+Title"
      cancelUrl="/"
      formData={formData}
      onSubmit={() => {}}
      schema={schema}
      step={step}
      steps={steps}
      uiSchema={operationRepresentativeUiSchema}
    />
  );
};

export default OperationRepresentativeForm;

"use client";

import MultiStepBase from "@bciers/components/form/MultiStepBase";
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
  operation,
  schema,
  step,
  steps,
}: OperationInformationFormProps) => {
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
      uiSchema={operationInformationUiSchema}
    />
  );
};

export default OperationInformationForm;

"use client";

import MultiStepBase from "@bciers/components/form/MultiStepBase";
import { optedInOperationUiSchema } from "apps/registration/app/data/jsonSchema/operationRegistration/optedInOperation";
import {
  OptedInOperationFormData,
  OperationRegistrationFormProps,
} from "apps/registration/app/components/operations/registration/types";

interface OptedInOperationFormProps extends OperationRegistrationFormProps {
  formData: OptedInOperationFormData;
}

const OptedInOperationForm = ({
  formData,
  operation,
  schema,
  step,
  steps,
}: OptedInOperationFormProps) => {
  return (
    <MultiStepBase
      allowBackNavigation
      baseUrl={`/register-an-operation/${operation}`}
      baseUrlParams="title=Placeholder+Title"
      cancelUrl="/"
      formData={formData}
      onSubmit={() => {}}
      schema={schema}
      step={step}
      steps={steps}
      uiSchema={optedInOperationUiSchema}
    />
  );
};

export default OptedInOperationForm;

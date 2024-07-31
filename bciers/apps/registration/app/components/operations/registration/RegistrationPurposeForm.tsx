"use client";

import MultiStepBase from "@bciers/components/form/MultiStepBase";
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
  operation,
  schema,
  step,
  steps,
}: RegistrationPurposeFormProps) => {
  return (
    <MultiStepBase
      // Uncomment this if this page changes to page 2 - no need for disabled back button on page 1 of form
      // allowBackNavigation
      baseUrl={`/operation/${operation}`}
      baseUrlParams="title=Placeholder+Title"
      cancelUrl="/"
      formData={formData}
      onSubmit={() => {}}
      schema={schema}
      step={step}
      steps={steps}
      uiSchema={registrationPurposeUiSchema}
    />
  );
};

export default RegistrationPurposeForm;

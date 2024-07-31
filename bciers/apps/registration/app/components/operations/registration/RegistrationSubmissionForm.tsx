"use client";

import MultiStepBase from "@bciers/components/form/MultiStepBase";
import { submissionUiSchema } from "apps/registration/app/data/jsonSchema/operationRegistration/submission";
import {
  RegistrationSubmissionFormData,
  OperationRegistrationFormProps,
} from "apps/registration/app/components/operations/registration/types";

interface RegistrationSubmissionFormProps
  extends OperationRegistrationFormProps {
  formData: RegistrationSubmissionFormData;
}

const RegistrationSubmissionForm = ({
  formData,
  operation,
  schema,
  step,
  steps,
}: RegistrationSubmissionFormProps) => {
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
      uiSchema={submissionUiSchema}
    />
  );
};

export default RegistrationSubmissionForm;

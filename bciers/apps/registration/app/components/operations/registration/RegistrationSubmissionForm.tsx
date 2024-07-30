"use client";

import FormBase from "@bciers/components/form/FormBase";
import MultiStepHeader from "@bciers/components/form/components/MultiStepHeader";
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  operation,
  schema,
  step,
  steps,
}: RegistrationSubmissionFormProps) => {
  return (
    <>
      <MultiStepHeader step={step} steps={steps} />
      <FormBase
        formData={formData}
        schema={schema}
        uiSchema={submissionUiSchema}
      />
    </>
  );
};

export default RegistrationSubmissionForm;

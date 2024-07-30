"use client";

import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const isNotFinalStep = step !== steps?.length;

  const handleSubmit = async () => {
    // This will have to be pulled from the response after the first page
    const OPERATION_ID = "002d5a9e-32a6-4191-938c-2c02bfec592d";
    // This will have to be pulled from the response after the second page
    const OPERATION_NAME = "Operation name placeholder";

    // Should we handle page transitions in multistepbase?
    const nextStepUrl = `/operation/${OPERATION_ID}/${
      step + 1
    }?title=${OPERATION_NAME}`;

    if (isNotFinalStep) {
      router.push(nextStepUrl);
    }
  };

  return (
    <MultiStepBase
      baseUrl={`/operation/${operation}`}
      cancelUrl="/"
      formData={formData}
      onSubmit={handleSubmit}
      schema={schema}
      step={step}
      steps={steps}
      uiSchema={submissionUiSchema}
    />
  );
};

export default RegistrationSubmissionForm;

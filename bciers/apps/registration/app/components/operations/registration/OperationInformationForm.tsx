"use client";

import MultiStepBase from "@bciers/components/form/MultiStepBase";
import { operationInformationUiSchema } from "apps/registration/app/data/jsonSchema/operationRegistration/operationInformation";
import { OperationInformationFormData } from "apps/registration/app/components/operations/registration/types";
import { actionHandler } from "@bciers/actions";
import { useRouter } from "next/navigation";
import { RJSFSchema } from "@rjsf/utils";

interface OperationInformationFormProps {
  formData: OperationInformationFormData;
  schema: RJSFSchema;
  step: number;
  steps: string[];
}

const OperationInformationForm = ({
  formData,
  schema,
  step,
  steps,
}: OperationInformationFormProps) => {
  const router = useRouter();
  const handleSubmit = async (data: { formData?: any }) => {
    const endpoint = `registration/v2/operations/${data.formData?.operation}/1`;
    const response = await actionHandler(endpoint, "PUT", "", {
      body: JSON.stringify(data.formData),
    });
    // handling the redirect here instead of in the MultiStepBase because we don't have the operation information until we receive the response
    const nextStepUrl = `/register-an-operation/${response.id}/${
      step + 1
    }${`?title=${response.name}`}`;
    router.push(nextStepUrl);
  };
  return (
    <MultiStepBase
      cancelUrl="/"
      formData={formData}
      onSubmit={handleSubmit}
      schema={schema}
      step={step}
      steps={steps}
      uiSchema={operationInformationUiSchema}
    />
  );
};

export default OperationInformationForm;

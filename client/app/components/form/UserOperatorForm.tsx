"use client";

import { RJSFSchema } from "@rjsf/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { userOperatorUiSchema } from "@/app/utils/jsonSchema/userOperator";
import MultiStepFormBase from "@/app/components/form/MultiStepFormBase";
import { createSubmitHandler } from "@/app/utils/actions";
import { UserOperatorFormData } from "@/app/components/form/formDataTypes";

export interface UserOperatorFormProps {
  schema: RJSFSchema;
  formData?: UserOperatorFormData;
  userOperatorId: number;
}

export default function UserOperatorForm({
  schema,
  formData,
  userOperatorId,
}: UserOperatorFormProps) {
  const { push } = useRouter();
  const [error, setError] = useState(undefined);

  return (
    <MultiStepFormBase
      baseUrl={`/dashboard/select-operator/user-operator/${userOperatorId}`}
      cancelUrl="/dashboard/select-operator"
      schema={schema}
      error={error}
      formData={formData}
      showSubmissionStep
      onSubmit={async (data: { formData?: UserOperatorFormData }) => {
        const response = await createSubmitHandler(
          "PUT",
          `registration/select-operator/user-operator/${userOperatorId}`,
          `/dashboard/select-operator/user-operator/${userOperatorId}`,
          data.formData,
        );

        if (response.error) {
          setError(response.error);
          return;
        }
        push(`/dashboard/select-operator/received/${response.res.operator_id}`);
      }}
      uiSchema={userOperatorUiSchema}
    />
  );
}

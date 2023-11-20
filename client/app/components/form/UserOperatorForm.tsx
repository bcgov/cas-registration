"use client";

import { RJSFSchema } from "@rjsf/utils";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  const params = useParams();
  const [error, setError] = useState(undefined);

  const formSection = parseInt(params?.formSection as string) - 1;
  const formSectionList = Object.keys(schema.properties as any);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isFinalStep = formSection === formSectionList.length - 1;

  return (
    <MultiStepFormBase
      baseUrl={`/dashboard/select-operator/user-operator/${userOperatorId}`}
      cancelUrl="/dashboard/select-operator"
      schema={schema}
      error={error}
      formData={formData}
      showSubmissionStep
      submitEveryStep
      onSubmit={async (data: { formData?: UserOperatorFormData }) => {
        const newFormData = {
          ...formData,
          ...data.formData,
          // Hacky method to get around api type check
          mailing_address_same_as_physical:
            formData?.mailing_address_same_as_physical
              ? formData?.mailing_address_same_as_physical
              : false,
          operator_has_parent_company: data.formData
            ?.operator_has_parent_company
            ? data.formData?.operator_has_parent_company
            : false,
          is_senior_officer: data.formData?.is_senior_officer || false,
        };

        const savePartialUrl = `registration/select-operator/user-operator/page-1/${userOperatorId}`;
        const saveFullUrl = `registration/select-operator/user-operator/submit/${userOperatorId}`;
        const apiUrl = isFinalStep ? saveFullUrl : savePartialUrl;
        const response = (await createSubmitHandler(
          "PUT",
          apiUrl,
          `/dashboard/select-operator/user-operator/${userOperatorId}`,
          newFormData,
        )) as any;

        if (response.error) {
          setError(response.error);
          return;
        }

        if (isFinalStep) {
          push(
            `/dashboard/select-operator/received/${response.res.operator_id}`,
          );
          return;
        }
        push(
          `/dashboard/select-operator/user-operator/${userOperatorId}/${
            formSection + 2
          }`,
        );
      }}
      uiSchema={userOperatorUiSchema}
    />
  );
}

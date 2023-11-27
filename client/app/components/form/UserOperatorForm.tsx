"use client";

import { RJSFSchema } from "@rjsf/utils";
import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { userOperatorUiSchema } from "@/app/utils/jsonSchema/userOperator";
import { actionHandler } from "@/app/utils/actions";
import MultiStepFormBase from "@/app/components/form/MultiStepFormBase";
import {
  UserOperatorFormData,
  UserFormData,
} from "@/app/components/form/formDataTypes";

interface UserOperatorFormProps {
  readonly schema: RJSFSchema;
  readonly formData: Partial<UserFormData>;
}

export default function UserOperatorForm({
  schema,
  formData,
}: UserOperatorFormProps) {
  const { push } = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [error, setError] = useState(undefined);
  const [formState, setFormState] = useState(formData);

  const formSection = parseInt(params?.formSection as string) - 1;

  const formSectionList = Object.keys(schema.properties as RJSFSchema);
  const isFinalStep = formSection === formSectionList.length - 1;

  const submitHandler = async (data: { formData?: UserOperatorFormData }) => {
    const newFormData = {
      ...formState,
      ...data.formData,
    } as UserOperatorFormData;

    // to prevent resetting the form state when errors occur
    setFormState(newFormData);

    // add user operator id to form data if it exists (to be used in senior officer creation)
    const userOperatorId = searchParams.get("user-operator-id");
    if (userOperatorId) newFormData.user_operator_id = userOperatorId;

    const apiUrl = `registration/user-operator/${
      isFinalStep ? "contact" : "operator"
    }`;

    const response = await actionHandler(
      apiUrl,
      "POST",
      `/dashboard/select-operator/user-operator/create/${params?.formSection}`,
      {
        body: JSON.stringify(newFormData),
      },
    );

    if (response.error) {
      setError(response.error);
      return;
    }

    if (isFinalStep) {
      push(
        `/dashboard/select-operator/received/add-operator/${response.res.operator_id}`,
      );
      return;
    }
    push(
      `/dashboard/select-operator/user-operator/create/${
        formSection + 2
      }?user-operator-id=${response.res.user_operator_id}`,
    );
  };

  return (
    <MultiStepFormBase
      baseUrl={"/dashboard/select-operator/user-operator/create"}
      cancelUrl="/dashboard/select-operator"
      schema={schema}
      error={error}
      formData={formState}
      submitEveryStep
      onSubmit={submitHandler}
      uiSchema={userOperatorUiSchema}
    />
  );
}

"use client";

import { RJSFSchema } from "@rjsf/utils";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { userOperatorUiSchema } from "@/app/utils/jsonSchema/userOperator";
import { actionHandler } from "@/app/utils/actions";
import { useSession } from "next-auth/react";
import UserOperatorReview from "@/app/components/routes/access-requests/form/UserOperatorReview";
import MultiStepFormBase from "@/app/components/form/MultiStepFormBase";
import {
  UserOperatorFormData,
  UserFormData,
} from "@/app/components/form/formDataTypes";

interface UserOperatorFormProps {
  readonly schema: RJSFSchema;
  readonly formData: Partial<UserFormData>;
  readonly disabled?: boolean;
}

export default function UserOperatorMultiStepForm({
  disabled,
  schema,
  formData,
}: UserOperatorFormProps) {
  const { data: session } = useSession();
  const { push } = useRouter();
  const params = useParams();
  const [error, setError] = useState(undefined);
  const [formState, setFormState] = useState(formData);

  const formSection = parseInt(params?.formSection as string) - 1;

  const formSectionList = Object.keys(schema.properties as RJSFSchema);
  const isFinalStep = formSection === formSectionList.length - 1;
  const userOperatorId = parseInt(params.id as string);

  const submitHandler = async (data: { formData?: UserOperatorFormData }) => {
    const newFormData = {
      ...formState,
      ...data.formData,
    } as UserOperatorFormData;

    // to prevent resetting the form state when errors occur
    setFormState(newFormData);

    // add user operator id to form data if it exists (to be used in senior officer creation)
    if (userOperatorId) newFormData.user_operator_id = params.id as string;

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
        `/dashboard/select-operator/received/add-operator/${response.operator_id}`,
      );
      return;
    }

    push(
      `/dashboard/select-operator/user-operator/create/${
        formSection + 2
      }?user-operator-id=${response.user_operator_id}`,
    );
  };

  const isAdmin = session?.user.app_role?.includes("cas");
  return (
    <>
      {isAdmin && (
        <UserOperatorReview
          userOperator={formData}
          userOperatorId={Number(userOperatorId)}
        />
      )}
      <MultiStepFormBase
        baseUrl={`/dashboard/operators/user-operator/${userOperatorId}`}
        cancelUrl="/dashboard/operators"
        schema={schema}
        disabled={isAdmin || disabled}
        error={error}
        formData={formData}
        submitEveryStep={!isAdmin}
        onSubmit={submitHandler}
        uiSchema={userOperatorUiSchema}
      />
    </>
  );
}

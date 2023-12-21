"use client";

import { RJSFSchema } from "@rjsf/utils";
import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { userOperatorUiSchema } from "@/app/utils/jsonSchema/userOperator";
import { actionHandler } from "@/app/utils/actions";
import { useSession } from "next-auth/react";
import UserOperatorForm from "./UserOperatorForm";
import { userOperatorPage2 } from "@/app/utils/jsonSchema/userOperator";
import UserOperatorReview from "@/app/components/routes/access-requests/form/UserOperatorReview";
import MultiStepFormBase from "@/app/components/form/MultiStepFormBase";
import { UserOperatorFormData } from "@/app/components/form/formDataTypes";

interface UserOperatorFormProps {
  readonly schema: RJSFSchema;
  readonly formData: Partial<UserOperatorFormData>;
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
  const searchParams = useSearchParams();
  const [error, setError] = useState(undefined);
  const [formState, setFormState] = useState(formData);

  const formSection = parseInt(params?.formSection as string) - 1;

  const formSectionList = Object.keys(schema.properties as RJSFSchema);
  const isFinalStep = formSection === formSectionList.length - 1;

  const userOperatorId =
    searchParams.get("user-operator-id") || (params?.id as string);
  const submitHandler = async (data: { formData?: UserOperatorFormData }) => {
    const newFormData = {
      ...formState,
      ...data.formData,
    } as UserOperatorFormData;

    // to prevent resetting the form state when errors occur
    setFormState(newFormData);

    // add user operator id to form data if it exists (to be used in senior officer creation)
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
        `/dashboard/select-operator/received/add-operator/${response.operator_id}`,
      );
      return;
    }

    push(
      `/dashboard/select-operator/user-operator/create/${
        formSection + 2
      }?user-operator-id=${response.user_operator_id}`,
    );
  }; // If the user is an approved cas internal user or if no operator exists show the entire multistep form
  const isCasInternal =
    session?.user.app_role?.includes("cas") &&
    !session?.user.app_role?.includes("pending");

  if (isCasInternal || !userOperatorId || formSection) {
    return (
      <>
        {isCasInternal && (
          <UserOperatorReview
            userOperator={formData as UserOperatorFormData}
            userOperatorId={Number(userOperatorId)}
          />
        )}
        <MultiStepFormBase
          baseUrl={`/dashboard/operators/user-operator/${userOperatorId}`}
          cancelUrl="/dashboard/operators"
          schema={schema}
          disabled={isCasInternal || disabled}
          error={error}
          formData={formData}
          submitEveryStep={!isCasInternal}
          onSubmit={submitHandler}
          uiSchema={userOperatorUiSchema}
        />
      </>
    );
  }

  // If the operator exists then show the form from the second page
  return <UserOperatorForm formData={formData} schema={userOperatorPage2} />;
}

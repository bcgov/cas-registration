"use client";

import { useState } from "react";
import SingleStepTaskListForm from "@bciers/components/form/SingleStepTaskListForm";
import { RJSFSchema } from "@rjsf/utils";
import { actionHandler } from "@bciers/actions";
import { operatorUiSchema } from "../../data/jsonSchema/operator";
import { FormMode } from "@bciers/utils/src/enums";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export interface OperatorFormData {
  [key: string]: any;
}

interface Props {
  schema: RJSFSchema;
  formData: OperatorFormData;
  isCreating?: boolean;
  isInternalUser: boolean;
  showTasklist?: boolean;
  showCancelOrBackButton?: boolean;
}
export default function OperatorForm({
  formData,
  schema,
  isCreating,
  isInternalUser,
  showTasklist = true,
  showCancelOrBackButton = true,
}: Readonly<Props>) {
  // @ ts-ignore

  const [error, setError] = useState(undefined);
  const [formState, setFormState] = useState(formData ?? {});
  const [isCreatingState, setIsCreatingState] = useState(isCreating);
  const router = useRouter();

  return (
    <SingleStepTaskListForm
      showCancelOrBackButton={showCancelOrBackButton}
      showTasklist={showTasklist}
      error={error}
      schema={schema}
      uiSchema={operatorUiSchema}
      formData={formState}
      mode={isCreatingState ? FormMode.CREATE : FormMode.READ_ONLY}
      allowEdit={!isInternalUser}
      onSubmit={async (data: { formData?: any }) => {
        const updatedFormData = { ...formState, ...data.formData };
        setFormState(updatedFormData);
        const method = isCreatingState ? "POST" : "PUT";
        const endpoint = isCreatingState
          ? "registration/user-operators"
          : "registration/user-operators/current/operator";
        const pathToRevalidate = "administration/operators";
        const response = await actionHandler(
          endpoint,
          method,
          pathToRevalidate,
          {
            body: JSON.stringify(data.formData),
          },
        );
        if (response?.error) {
          setError(response.error);
          return { error: response.error };
        } else {
          setError(undefined);
        }
        if (isCreatingState) {
          setIsCreatingState(false);
          // we sign the user in again to augment the app_role to "industry_user_admin" (we don't use next-auth's `useSession.update` because if we have useSession in this component, the SessionTimeoutHandler's refreshSession wipes the form data every time it refreshes)
          signIn(
            "keycloak",
            { redirect: true, redirectTo: "/administration/my-operator" },
            { kc_idp_hint: "bceidbusiness" },
          );
        }
      }}
      onCancel={() =>
        isCreatingState || isInternalUser ? router.back() : router.push("/")
      }
    />
  );
}

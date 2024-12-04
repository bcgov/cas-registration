"use client";

import { useState } from "react";
import SingleStepTaskListForm from "@bciers/components/form/SingleStepTaskListForm";
import { RJSFSchema } from "@rjsf/utils";
import { actionHandler } from "@bciers/actions";
import { operatorUiSchema } from "../../data/jsonSchema/operator";
import { FormMode } from "@bciers/utils/src/enums";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export interface OperatorFormData {
  [key: string]: any;
}

interface Props {
  schema: RJSFSchema;
  formData: OperatorFormData;
  isCreating?: boolean;
  isInternalUser: boolean;
}
export default function OperatorForm({
  formData,
  schema,
  isCreating,
  isInternalUser,
}: Readonly<Props>) {
  // @ ts-ignore
  const [error, setError] = useState(undefined);

  const [formState, setFormState] = useState(formData ?? {});
  const [isCreatingState, setIsCreatingState] = useState(isCreating);
  const router = useRouter();
  const { update } = useSession();
  return (
    <SingleStepTaskListForm
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
          // With Auth strategy: "jwt" , update() method will trigger a jwt callback
          // where app_role will be augmented to "industry_user_admin" in the jwt and session objects
          await update({ trigger: "update" }); // Indicate this is an update call to update the session token
        }
      }}
      onCancel={() =>
        isCreatingState || isInternalUser ? router.back() : router.push("/")
      }
    />
  );
}

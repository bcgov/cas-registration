"use client";

import { useState } from "react";
import SingleStepTaskListForm from "@bciers/components/form/SingleStepTaskListForm";
import { RJSFSchema } from "@rjsf/utils";
import { operatorUiSchema } from "../../data/jsonSchema/operator";
import { FormMode } from "@bciers/utils/src/enums";
import { useRouter } from "next/navigation";
import { getSession, useSession } from "next-auth/react";
import { actionHandler } from "@bciers/actions";
import { useMemo } from "react";
import { customizeValidator } from "@rjsf/validator-ajv8";
import { FormProps, IChangeEvent, withTheme, ThemeProps } from "@rjsf/core";
import customTransformErrors from "@bciers/utils/src/customTransformErrors";
import { RJSFValidationError } from "@rjsf/utils";
import { theme } from "@bciers/components";
import defaultTheme from "@bciers/components/form/theme/defaultTheme";

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

export async function updateToken() {
  const response = await fetch("/api/auth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Failed to update token: ${errorData.error || response.statusText}`,
    );
  }

  return await response.json();
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
  console.log("OperatorForm");
  const [error, setError] = useState(undefined);
  // const [formState, setFormState] = useState(formData ?? {});
  const [isCreatingState, setIsCreatingState] = useState(isCreating);
  const router = useRouter();
  const { update } = useSession();
  // console.log("formData", formData);
  // console.log("formState", formState);
  const Form = useMemo(() => withTheme(defaultTheme), []);
  const validator = customizeValidator();
  return (
    <>
      <Form
        // {...props}
        onChange={(e: IChangeEvent) => {
          console.log(e.formData);
        }}
        schema={schema}
        formData={formData}
        onSubmit={async (e: IChangeEvent) => {
          console.log("handleSubmit", e.formData);
        }}
        noHtml5Validate
        showErrorList={false}
        validator={validator}
      />
      {/* <SingleStepTaskListForm
        showCancelOrBackButton={showCancelOrBackButton}
        showTasklist={showTasklist}
        error={error}
        schema={schema}
        uiSchema={operatorUiSchema}
        formData={formState}
        mode={isCreatingState ? FormMode.CREATE : FormMode.READ_ONLY}
        allowEdit={!isInternalUser}
        onSubmit={async (data: { formData?: any }) => {
          console.log("data.formData", data.formData);
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
            // calling getSession updates the session, which will augment app_role to "industry_user_admin"
            await getSession({ trigger: "update" });
            // await update({ trigger: "update" });
            // await updateToken();
          }
        }}
        onCancel={() =>
          isCreatingState || isInternalUser ? router.back() : router.push("/")
        }
      /> */}
    </>
  );
}

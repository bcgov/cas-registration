"use client";

import { RJSFSchema } from "@rjsf/utils";
import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { userOperatorUiSchema } from "@/app/utils/jsonSchema/userOperator";
import { actionHandler } from "@/app/utils/actions";
import {
  UserOperatorFormData,
  UserFormData,
} from "@/app/components/form/formDataTypes";
import { Alert, Button } from "@mui/material";
import SubmitButton from "@/app/components/form/SubmitButton";
import FormBase from "@/app/components/form/FormBase";

interface UserOperatorFormProps {
  schema: RJSFSchema;
  formData: Partial<UserFormData>;
  readonly?: boolean;
}

export default function UserOperatorContactForm({
  schema,
  formData,
  readonly = false,
}: Readonly<UserOperatorFormProps>) {
  const { push, back } = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [error, setError] = useState(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitHandler = async (data: { formData?: UserOperatorFormData }) => {
    setIsSubmitting(true);
    const newFormData = {
      ...data.formData,
    } as UserOperatorFormData;

    // add user operator id to form data if it exists (to be used in senior officer creation)
    newFormData.user_operator_id =
      searchParams.get("user-operator-id") ?? undefined;

    const apiUrl = "registration/user-operator/contact";

    const response = readonly
      ? await actionHandler(
          apiUrl,
          "GET",
          `/dashboard/select-operator/user-operator/create/${params?.formSection}`,
        )
      : await actionHandler(
          apiUrl,
          "POST",
          `/dashboard/select-operator/user-operator/create/${params?.formSection}`,
          {
            body: JSON.stringify(newFormData),
          },
        );

    if (response.error) {
      setError(response.error);
      setIsSubmitting(false);
      return;
    }

    push(
      `/dashboard/select-operator/received/request-access/${response.operator_id}`,
    );
  };

  return (
    <FormBase
      schema={schema}
      readonly={readonly}
      formData={formData}
      onSubmit={submitHandler}
      uiSchema={userOperatorUiSchema}
      setErrorReset={setError}
    >
      {error && <Alert severity="error">{error}</Alert>}
      <div className={"flex my-8 justify-between"}>
        <Button variant="outlined" onClick={() => back()}>
          Cancel
        </Button>
        <SubmitButton disabled={isSubmitting} label="Submit" />
      </div>
    </FormBase>
  );
}

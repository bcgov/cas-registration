"use client";

import { RJSFSchema } from "@rjsf/utils";
import Form from "@/app/components/form/FormBase";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { userOperatorUiSchema } from "@/app/utils/jsonSchema/userOperator";
import { actionHandler } from "@/app/utils/actions";
import {
  UserOperatorFormData,
  UserFormData,
} from "@/app/components/form/formDataTypes";
import { Alert, Button } from "@mui/material";
import SubmitButton from "@/app/components/form/SubmitButton";

interface UserOperatorFormProps {
  schema: RJSFSchema;
  formData: Partial<UserFormData>;
  readonly?: boolean;
}

export default function UserOperatorMultiStepForm({
  schema,
  formData,
  readonly
}: Readonly<UserOperatorFormProps>) {
  const { push, back } = useRouter();
  const params = useParams();
  const [errorList, setErrorList] = useState([] as any[]);
  const [formState, setFormState] = useState(formData);
  const userOperatorId: string = params.id.toString();

  const submitHandler = async (data: { formData?: UserOperatorFormData }) => {
    const newFormData = {
      ...formState,
      ...data.formData,
    } as UserOperatorFormData;

    // add user operator id to form data if it exists (to be used in senior officer creation)
    newFormData.user_operator_id = userOperatorId;

    // to prevent resetting the form state when errors occur
    setFormState(newFormData);

    // add user operator id to form data if it exists (to be used in senior officer creation)
    const userOperatorId = searchParams.get("user-operator-id");
    if (userOperatorId) newFormData.user_operator_id = userOperatorId;

    const apiUrl = `registration/user-operator/${
      isFinalStep ? "contact" : "operator"
    }`;

    let response: Promise<any>;
    if (readonly) {
      response = await actionHandler(
        apiUrl,
        "GET",
        `/dashboard/select-operator/user-operator/create/${params?.formSection}`,
      );
    } else {
      response = await actionHandler(
        apiUrl,
        "POST",
        `/dashboard/select-operator/user-operator/create/${params?.formSection}`,
        {
          body: JSON.stringify(newFormData),
        },
      );
    }

    if (response.error) {
      setErrorList([{ message: response.error }]);
      return;
    }

    push(
      `/dashboard/select-operator/received/request-access/${response.operator_id}`,
    );
  };

  return (
    <Form
      schema={schema}
      error={error}
      readonly={readonly}
      formData={formState}
      onSubmit={submitHandler}
      uiSchema={userOperatorUiSchema}
    >
      {errorList.length > 0 &&
        errorList.map((e: any) => (
          <Alert key={e.message} severity="error">
            {e.message}
          </Alert>
        ))}
      <div className={"flex my-8 justify-between"}>
        <Button variant="outlined" onClick={() => back()}>
          Cancel
        </Button>
        <SubmitButton label="Submit" />
      </div>
    </Form>
  );
}

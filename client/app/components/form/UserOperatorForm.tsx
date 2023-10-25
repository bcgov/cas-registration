"use client";

import { Form } from "@rjsf/mui";
import { RJSFSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { useState } from "react";
import { Alert, Button } from "@mui/material";
import SubmitButton from "./SubmitButton";
import { useRouter } from "next/navigation";
import { userOperatorUiSchema } from "@/app/utils/jsonSchema/userOperator";
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
  const [errorList, setErrorList] = useState([] as any[]);

  return (
    <Form
      schema={schema}
      validator={validator}
      showErrorList={false}
      formData={formData}
      onSubmit={async (data: { formData?: UserOperatorFormData }) => {
        const response = await createSubmitHandler(
          "PUT",
          `registration/select-operator/request-access/user-operator/${userOperatorId}`,
          `/select-operator/request-access/user-operator/${userOperatorId}`,
          data.formData,
        );

        if (response.error) {
          setErrorList([{ message: response.error }]);
          return;
        }
        push(
          `/select-operator/request-access/received/${response.operator_id}`,
        );
      }}
      uiSchema={userOperatorUiSchema}
      className="flex flex-col w-3/4 mx-auto"
    >
      {errorList.length > 0 &&
        errorList.map((e: any) => (
          <Alert key={e.message} severity="error">
            {e?.stack ?? e.message}
          </Alert>
        ))}
      <div className="flex justify-end gap-3">
        <SubmitButton label="Submit" />
        <Button
          variant="outlined"
          onClick={() => push("/select-operator")}
          sx={{ marginBottom: 10 }}
        >
          Cancel
        </Button>
      </div>
    </Form>
  );
}

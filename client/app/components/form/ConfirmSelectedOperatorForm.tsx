"use client";

import Form from "@/app/components/form/FormBase";
import validator from "@rjsf/validator-ajv8";
import SubmitButton from "./SubmitButton";
import { Alert } from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { actionHandler } from "@/app/utils/actions";

interface ConfirmSelectedOperatorFormProps {
  operator_id: number;
}

export default function ConfirmSelectedOperatorForm({
  operator_id,
}: ConfirmSelectedOperatorFormProps) {
  const { push } = useRouter();
  const [errorList, setErrorList] = useState([] as any[]);

  return (
    <Form
      schema={{}}
      validator={validator}
      onSubmit={async () => {
        const response = await actionHandler(
          "registration/select-operator/request-access",
          "POST",
          `/dashboard/select-operator/user-operator/${operator_id}`,
          {
            body: JSON.stringify({
              operator_id,
            }),
          },
        );
        if (response.error) {
          setErrorList([{ message: response.error }]);
          return;
        }

        push(
          `/dashboard/select-operator/user-operator/${response.user_operator_id}`,
        );
      }}
      className="flex flex-col w-64 mx-auto gap-2"
    >
      {errorList.length > 0 &&
        errorList.map((e: any) => (
          <Alert key={e.message} severity="error">
            {e.message}
          </Alert>
        ))}
      <SubmitButton
        label="Request Access as Administrator"
        classNames="w-max"
      />
    </Form>
  );
}

"use client";

import { Form } from "@rjsf/mui";
import validator from "@rjsf/validator-ajv8";
import SubmitButton from "./SubmitButton";
import { Alert } from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSubmitHandler } from "@/app/utils/actions";

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
        const response = await createSubmitHandler(
          "POST",
          "registration/select-operator/request-access",
          `/select-operator/request-access/confirm/${operator_id}`,
          {
            operator_id,
          },
        );
        if (response.error) {
          setErrorList([{ message: response.error }]);
          return;
        }

        push(
          `/select-operator/request-access/user-operator/${response.user_operator_id}`,
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
      <SubmitButton label="Request Access" />
    </Form>
  );
}

"use client";

import { Form } from "@rjsf/mui";
import validator from "@rjsf/validator-ajv8";
import SubmitButton from "./SubmitButton";
import { Alert } from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSubmitHandler } from "@/app/utils/actions";

interface AccessRequestFormProps {
  operator_id: number;
}

export default function AccessRequestForm({
  operator_id,
}: AccessRequestFormProps) {
  const { push } = useRouter();
  const [errorList, setErrorList] = useState([] as any[]);

  const handleErrors = (errors: any) => {
    setErrorList(errors);
  };

  return (
    <Form
      schema={{}}
      validator={validator}
      onError={handleErrors}
      showErrorList={false}
      onSubmit={async () => {
        const response = await createSubmitHandler(
          "POST",
          `registration/select-operator/request-access`,
          "/select-operator",
          {
            operator_id,
          },
        );
        if (response.error) {
          setErrorList([{ message: response.error }]);
          return;
        }

        push("/user-operator");
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

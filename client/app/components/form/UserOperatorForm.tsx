"use client";

import { Form } from "@rjsf/mui";
import { RJSFSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { useState } from "react";
import { Alert } from "@mui/material";
import SubmitButton from "./SubmitButton";
// import { createSubmitHandler } from "@/app/utils/actions/createSubmitHandlers";
// import { useRouter } from "next/navigation";
import { userOperatorUiSchema } from "@/app/utils/jsonSchema/userOperator";
import { Button } from "@mui/material";

// export interface SelectOperatorFormData {
//   operator_id: number;
// }

interface UserOperatorFormProps {
  schema: RJSFSchema;
}

export default function UserOperatorForm({ schema }: UserOperatorFormProps) {
  // const { push } = useRouter();
  const [errorList, setErrorList] = useState([] as any[]);
  const [formData, setFormData] = useState({});

  const handleChange = (data: { formData }) => {
    setErrorList([]);
    setFormData(data.formData);
  };

  const handleErrors = (errors: any) => {
    setErrorList(errors);
  };

  return (
    <Form
      schema={schema}
      onError={handleErrors}
      validator={validator}
      showErrorList={false}
      formData={formData}
      // onSubmit={async (data: { formData?: SelectOperatorFormData }) => {
      //   const response = await createSubmitHandler(
      //     "GET",
      //     `registration/select-operator/${data.formData?.operator_id}`,
      //     "/select-operator"
      //   );
      //   if (response.error) {
      //     setErrorList([{ message: response.error }]);
      //     return;
      //   }

      //   push(`/select-operator/${response.operator_id}`);
      // }}
      uiSchema={userOperatorUiSchema}
      onChange={handleChange}
      className="flex flex-col gap-2 w-3/4 mx-auto"
    >
      {errorList.length > 0 &&
        errorList.map((e: any) => (
          <Alert key={e.message} severity="error">
            {e.message}
          </Alert>
        ))}
      <div className="flex justify-end gap-3">
        <SubmitButton label="Submit" />
        <Button variant="outlined">Cancel</Button>
      </div>
    </Form>
  );
}

"use client";

import Form from "@/app/components/form/FormBase";
import { RJSFSchema } from "@rjsf/utils";
import { useState } from "react";
import { Alert } from "@mui/material";
import { selectOperatorUiSchema } from "@/app/utils/jsonSchema/selectOperator";
import { useRouter } from "next/navigation";
import { actionHandler } from "@/app/utils/actions";
import { SelectOperatorFormData } from "@/app/components/form/formDataTypes";

interface SelectOperatorFormProps {
  schema: RJSFSchema;
}

export default function SelectOperatorForm({
  schema,
}: SelectOperatorFormProps) {
  const { push } = useRouter();
  const [errorList, setErrorList] = useState([] as any[]);

  // taking the control of the form data to be able to reset errors on change
  const [formData, setFormData] = useState({} as SelectOperatorFormData);

  const handleChange = (data: { formData?: SelectOperatorFormData }) => {
    setErrorList([]);
    setFormData(data.formData as SelectOperatorFormData);
  };

  return (
    <Form
      schema={schema}
      formData={formData}
      onSubmit={async (data: { formData?: SelectOperatorFormData }) => {
        const response = await actionHandler(
          `registration/operators/${data.formData?.operator_id}`,
          "GET",
          "/dashboard/select-operator",
        );

        if (response.error) {
          setErrorList([{ message: response.error }]);
          return;
        }

        push(`/dashboard/select-operator/confirm/${response.id}`);
      }}
      uiSchema={selectOperatorUiSchema}
      onChange={handleChange}
      className="mx-auto"
    >
      {errorList.length > 0 &&
        errorList.map((e: any) => (
          <Alert key={e.message} severity="error">
            {e.message}
          </Alert>
        ))}
      <></>
    </Form>
  );
}

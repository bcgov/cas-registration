"use client";

import { Form } from "@rjsf/mui";
import { RJSFSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { useState } from "react";
import { Alert } from "@mui/material";
import SubmitButton from "./SubmitButton";
import ComboBox from "@/app/components/widgets/ComboBox";
import { selectOperatorUiSchema } from "@/app/utils/jsonSchema/selectOperator";
import { createSubmitHandler } from "@/app/utils/actions/createSubmitHandlers";
import { useRouter } from "next/navigation";

export interface SelectOperatorFormData {
  operator_id: number;
}

interface SelectOperatorFormProps {
  schema: RJSFSchema;
}

export default function SelectOperatorForm({
  schema,
}: SelectOperatorFormProps) {
  const { push } = useRouter();
  const [errorList, setErrorList] = useState([] as any[]);
  const [formData, setFormData] = useState({} as SelectOperatorFormData);

  const handleChange = (data: { formData?: SelectOperatorFormData }) => {
    setErrorList([]);
    setFormData(data.formData as SelectOperatorFormData);
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
      onSubmit={async (data: { formData?: SelectOperatorFormData }) => {
        const response = await createSubmitHandler(
          "GET",
          `registration/select-operator/${data.formData?.operator_id}`,
          "/select-operator",
        );
        if (response.error) {
          setErrorList([{ message: response.error }]);
          return;
        }

        push(`/select-operator/${response.operator_id}`);
      }}
      uiSchema={selectOperatorUiSchema}
      widgets={{
        ComboBox,
      }}
      onChange={handleChange}
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

"use client";

import Form from "@/app/components/form/FormBase";
import { RJSFSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { useState } from "react";
import { Alert } from "@mui/material";
import SubmitButton from "@/app/components/form/SubmitButton";
import ComboBox from "@/app/components/form/widgets/ComboBox";
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
      validator={validator}
      formData={formData}
      onSubmit={async (data: { formData?: SelectOperatorFormData }) => {
        const response = await actionHandler(
          `registration/select-operator/${data.formData?.operator_id}`,
          "GET",
          "/dashboard/select-operator",
        );

        if (response.error) {
          setErrorList([{ message: response.error }]);
          return;
        }

        push(`/dashboard/select-operator/confirm/${response.res.operator_id}`);
      }}
      uiSchema={selectOperatorUiSchema}
      widgets={{
        ComboBox,
      }}
      onChange={handleChange}
      className="flex flex-col mx-auto justify-center w-80"
    >
      {errorList.length > 0 &&
        errorList.map((e: any) => (
          <Alert key={e.message} severity="error">
            {e.message}
          </Alert>
        ))}
      <SubmitButton label="Request Access" classNames="mt-4" />
    </Form>
  );
}

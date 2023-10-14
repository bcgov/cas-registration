"use client";

import { Form } from "@rjsf/mui";
import { RJSFSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { useState } from "react";
import { Alert } from "@mui/material";
import SubmitButton from "@/app/components/form/SubmitButton";
import ComboBox from "@/app/components/widgets/ComboBox";
import { selectOperatorUiSchema } from "@/app/utils/jsonSchema/selectOperator";
import { useRouter } from "next/navigation";
import { createSubmitHandler } from "@/app/utils/actions";
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
        const response = await createSubmitHandler(
          "GET",
          `registration/select-operator/${data.formData?.operator_id}`,
          "/dashboard/select-operator",
        );

        if (response.error) {
          setErrorList([{ message: response.error }]);
          return;
        }

        push(
          `/dashboard/select-operator/request-access/confirm/${response.res.operator_id}`,
        );
      }}
      uiSchema={selectOperatorUiSchema}
      widgets={{
        ComboBox,
      }}
      onChange={handleChange}
      className="flex flex-col w-80 mx-auto gap-2"
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

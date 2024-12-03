"use client";

import Form from "@bciers/components/form/FormBase";
import { RJSFSchema } from "@rjsf/utils";
import { useState } from "react";
import { Alert } from "@mui/material";
import { useRouter } from "next/navigation";
import { actionHandler } from "@bciers/actions";
import { SelectOperatorFormData } from "@/app/components/form/formDataTypes";
import { selectOperatorUiSchema } from "@/app/utils/jsonSchema/selectOperator";

interface SelectOperatorFormProps {
  schema: RJSFSchema;
}

export default function SelectOperatorForm({
  schema,
}: Readonly<SelectOperatorFormProps>) {
  const { push } = useRouter();
  const [errorList, setErrorList] = useState([] as any[]);

  return (
    <Form
      formContext={{ endpoint: "registration/v1/operators" }}
      schema={schema}
      onSubmit={async (data: { formData?: SelectOperatorFormData }) => {
        const queryParam = `?${data.formData?.search_type}=${data.formData?.[
          data.formData?.search_type as keyof SelectOperatorFormData
        ]}`;

        const response = await actionHandler(
          `registration/v1/operators${queryParam}`,
          "GET",
          "/dashboard/select-operator",
        );
        if (response.error) {
          setErrorList([{ message: response.error }]);
          return;
        }
        // If the response is an array, we want the first element
        let operatorId;
        let operatorLegalName;
        if (response.length > 0) {
          operatorId = response[0].id;
          operatorLegalName = response[0].legal_name;
        } else {
          operatorId = response.id;
          operatorLegalName = response.legal_name;
        }
        push(
          `/dashboard/select-operator/confirm/${operatorId}?title=${operatorLegalName}`,
        );
      }}
      uiSchema={selectOperatorUiSchema}
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

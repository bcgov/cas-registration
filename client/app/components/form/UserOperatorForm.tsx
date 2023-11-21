"use client";

import Form from "./FormBase";
import { RJSFSchema } from "@rjsf/utils";
import { useState } from "react";
import { Alert, Button } from "@mui/material";
import SubmitButton from "./SubmitButton";
import { useRouter } from "next/navigation";
import { userOperatorUiSchema } from "@/app/utils/jsonSchema/userOperator";
import { actionHandler } from "@/app/utils/actions";
import {
  UserFormData,
  UserOperatorFormData,
} from "@/app/components/form/formDataTypes";

export interface UserOperatorFormProps {
  schema: RJSFSchema;
  formData?: UserFormData | UserOperatorFormData;
  userOperatorId?: number;
}

export default function UserOperatorForm({
  schema,
  formData,
  userOperatorId,
}: UserOperatorFormProps) {
  const { push } = useRouter();
  const [errorList, setErrorList] = useState([] as any[]);

  // manage formDataState to prevent formData from being reset on submit
  const [formDataState, setFormDataState] = useState(formData);

  const localSchema = JSON.parse(JSON.stringify(schema));
  if (userOperatorId && localSchema.properties) {
    localSchema.properties.cra_business_number = {
      ...localSchema.properties.cra_business_number,
      readOnly: true,
    };
    localSchema.properties.bc_corporate_registry_number = {
      ...localSchema.properties.bc_corporate_registry_number,
      readOnly: true,
    };
  }

  const submitHandler = async (data: { formData?: UserOperatorFormData }) => {
    setFormDataState(data.formData);

    const endpointPrefix = "/dashboard/select-operator";
    const method = userOperatorId ? "PUT" : "POST";
    const urlSuffix = userOperatorId
      ? `user-operator/${userOperatorId}`
      : "user-operator";

    const response = await actionHandler(
      `registration/select-operator/${urlSuffix}`,
      method,
      `${endpointPrefix}${urlSuffix}`,
      {
        body: JSON.stringify(data.formData),
      },
    );

    if (response.error) {
      setErrorList([{ message: response.error }]);
      return;
    }

    const operatorId = response.res.operator_id;
    push(`${endpointPrefix}/received/${operatorId}`);
  };

  return (
    <Form
      schema={localSchema}
      formData={formDataState}
      onSubmit={submitHandler}
      uiSchema={userOperatorUiSchema}
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
          onClick={() => push("/dashboard/select-operator")}
          sx={{ marginBottom: 10 }}
        >
          Cancel
        </Button>
      </div>
    </Form>
  );
}

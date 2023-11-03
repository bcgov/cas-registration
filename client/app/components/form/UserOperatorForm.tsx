"use client";

import Form from "./FormBase";
import { RJSFSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { useState } from "react";
import { Alert, Button } from "@mui/material";
import SubmitButton from "./SubmitButton";
import { useRouter } from "next/navigation";
import { userOperatorUiSchema } from "@/app/utils/jsonSchema/userOperator";
import { actionHandler } from "@/app/utils/actions";
import { UserOperatorFormData } from "@/app/components/form/formDataTypes";

export interface UserOperatorFormProps {
  schema: RJSFSchema;
  formData?: UserOperatorFormData;
  userOperatorId?: number;
}

export default function UserOperatorForm({
  schema,
  formData,
  userOperatorId,
}: UserOperatorFormProps) {
  const { push } = useRouter();
  const [errorList, setErrorList] = useState([] as any[]);

  const localSchema = schema;
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

  return (
    <Form
      schema={localSchema}
      validator={validator}
      showErrorList={false}
      formData={formData}
      onSubmit={async (data: { formData?: UserOperatorFormData }) => {
        const response = await actionHandler(
          `registration/select-operator/user-operator/${userOperatorId}`,
          "PUT",
          `/dashboard/select-operator/user-operator/${userOperatorId}`,
          {
            body: JSON.stringify(data.formData),
          },
        );

        if (response.error) {
          setErrorList([{ message: response.error }]);
          return;
        }
        push(`/dashboard/select-operator/received/${response.operator_id}`);
      }}
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

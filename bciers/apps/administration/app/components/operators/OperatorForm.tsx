"use client";

import { useState } from "react";
import SingleStepTaskListForm from "@bciers/components/form/SingleStepTaskListForm";
import { RJSFSchema } from "@rjsf/utils";
import { actionHandler } from "@bciers/actions";
import { operatorUiSchema } from "../../data/jsonSchema/operator";

export interface OperatorFormData {
  [key: string]: any;
}

interface Props {
  schema: RJSFSchema;
  formData: OperatorFormData;
  isCreating?: boolean;
}

export default function OperatorForm({
  formData,
  schema,
  isCreating,
}: Readonly<Props>) {
  // @ ts-ignore
  const [error, setError] = useState(undefined);
  return (
    <>
      <SingleStepTaskListForm
        error={error}
        schema={schema}
        uiSchema={operatorUiSchema}
        formData={formData}
        onSubmit={async (data: { formData?: any }) => {
          const method = isCreating ? "POST" : "PUT";
          const endpoint = isCreating
            ? "tbd"
            : `registration/v2/user-operators/current/operator`;
          const pathToRevalidate = "administration/operators";
          const response = await actionHandler(
            endpoint,
            method,
            pathToRevalidate,
            {
              body: JSON.stringify(data.formData),
            },
          );
          if (response.error) {
            setError(response.error);
            // return error so SingleStepTaskList can re-enable the submit button and user can attempt to submit again
            return { error: response.error };
          }
          if (isCreating) {
            // tbd
          }
        }}
        onCancel={() => console.log("cancelled")}
      />
    </>
  );
}

"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  // const [confirmation, setConfirmation] = useState(false);
  const router = useRouter();
  const params = useParams();
  return (
    <>
      {/* {confirmation && <div>success</div>} */}
      <SingleStepTaskListForm
        error={error}
        schema={schema}
        uiSchema={operatorUiSchema}
        formData={formData}
        onSubmit={async (data: { formData?: any }) => {
          const method = isCreating ? "POST" : "PUT";
          const endpoint = isCreating
            ? "registration/v2/user-operators"
            : `registration/v2/user-operators/current`;
          const pathToRevalidate = isCreating ? "dashboard/facilities" : `tbd`;
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
          // setConfirmation(true);
          if (isCreating) {
            router.replace(
              `/operations/${params.operationId}/facilities/${response.id}?title=${response.name}`,
              // @ts-ignore
              { shallow: true },
            );
          }
        }}
        onCancel={() => console.log("cancelled")}
      />
    </>
  );
}

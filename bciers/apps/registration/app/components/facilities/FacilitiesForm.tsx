"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SingleStepTaskListForm from "@bciers/components/form/SingleStepTaskListForm";
import { actionHandler } from "@bciers/utils/actions";

export interface FacilityFormData {
  [key: string]: any;
}

interface Props {
  schema: any;
  uiSchema: any;
  formData: FacilityFormData;
  disabled?: boolean;
}

export default function FacilitiesForm({
  formData,
  schema,
  uiSchema,
  disabled,
}: Readonly<Props>) {
  console.log("formdata", formData);
  // @ ts-ignore
  const [error, setError] = useState(undefined);
  const [confirmation, setConfirmation] = useState(false);
  const router = useRouter();
  const params = useParams();
  let isCreating = Object.keys(formData).length > 0 ? false : true;
  return (
    <>
      {confirmation && <div>success</div>}
      <SingleStepTaskListForm
        error={error}
        disabled={disabled}
        schema={schema}
        uiSchema={uiSchema}
        formData={formData}
        onSubmit={async (data: { formData?: any }) => {
          const method = isCreating ? "POST" : "PUT";
          const endpoint = isCreating ? "registration/facilities" : `tbd`;
          const pathToRevalidate = isCreating ? "dashboard/facilities" : `tbd`;
          // brianna bug potential this is going to overwrite with nesting, going to have to do some processing here
          const body = {
            ...formData?.section1,
            ...formData?.section2,
            ...data.formData.section1,
            ...data.formData.section2,
            operation_id: params.operationId,
          };
          const response = await actionHandler(
            endpoint,
            method,
            pathToRevalidate,
            {
              body: JSON.stringify(body),
            },
          );
          if (response.error) {
            setError(response.error);
            // return error so SingleStepTaskList can re-enable the submit button and user can attempt to submit again
            return { error: response.error };
          }
          setConfirmation(true);
          if (isCreating) {
            router.replace(
              `/operations/${params.operationId}/facilities/${response.id}`,
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

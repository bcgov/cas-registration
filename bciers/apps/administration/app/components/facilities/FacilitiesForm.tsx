"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SingleStepTaskListForm from "@bciers/components/form/SingleStepTaskListForm";
import { actionHandler } from "@bciers/actions";
import { FormMode } from "@bciers/utils/enums";

export interface FacilityFormData {
  [key: string]: any;
}

interface Props {
  schema: any;
  uiSchema: any;
  formData: FacilityFormData;
  isCreating?: boolean;
}

export default function FacilitiesForm({
  formData,
  schema,
  uiSchema,
  isCreating,
}: Readonly<Props>) {
  // @ ts-ignore
  const [error, setError] = useState(undefined);
  const router = useRouter();
  const params = useParams();

  return (
    <SingleStepTaskListForm
      error={error}
      disabled={!isCreating}
      schema={schema}
      uiSchema={uiSchema}
      formData={formData}
      mode={isCreating ? FormMode.CREATE : FormMode.READ_ONLY}
      onSubmit={async (data: { formData?: any }) => {
        const method = isCreating ? "POST" : "PUT";
        const endpoint = isCreating ? "registration/facilities" : `tbd`;
        const pathToRevalidate = endpoint; // for now the endpoint is the same as the path to revalidate
        // facilities endpoint requires an array of facilities. In this case we are just creating one.
        const body = [
          {
            ...data.formData,
            operation_id: params.operationId,
          },
        ];
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
        if (isCreating) {
          router.replace(
            `/operations/${params.operationId}/facilities/${response.id}?facilities_title=${response.name}`,
            // @ts-ignore
            { shallow: true },
          );
        }
      }}
      onCancel={() => console.log("cancelled")}
    />
  );
}

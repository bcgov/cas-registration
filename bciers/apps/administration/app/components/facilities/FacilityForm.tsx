"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import SingleStepTaskListForm from "@bciers/components/form/SingleStepTaskListForm";
import { actionHandler } from "@bciers/actions";
import { FormMode } from "@bciers/utils/enums";
import serializeSearchParams from "@bciers/utils/serializeSearchParams";

export interface FacilityFormData {
  [key: string]: any;
}

interface Props {
  schema: any;
  uiSchema: any;
  formData: FacilityFormData;
  isCreating?: boolean;
}

export default function FacilityForm({
  formData,
  schema,
  uiSchema,
  isCreating,
}: Readonly<Props>) {
  // @ ts-ignore
  const [error, setError] = useState(undefined);
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  return (
    <SingleStepTaskListForm
      error={error}
      schema={schema}
      uiSchema={uiSchema}
      formData={formData}
      mode={isCreating ? FormMode.CREATE : FormMode.READ_ONLY}
      onSubmit={async (data: { formData?: any }) => {
        const method = isCreating ? "POST" : "PUT";
        const endpoint = isCreating
          ? "registration/facilities"
          : `registration/facilities/${formData?.id}`;
        const pathToRevalidate = endpoint; // for now the endpoint is the same as the path to revalidate
        const body = {
          ...data.formData,
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
        if (isCreating) {
          // 🛸 build the route url with breadcrumbs pattern
          const queryString =
            serializeSearchParams(searchParams) +
            `&facilitiesTitle=${response.name}`;
          router.replace(
            `/operations/${params.operationId}/facilities/${response.id}${queryString}`,
            // @ts-ignore
            { shallow: true },
          );
        }
      }}
      onCancel={() => console.log("cancelled")}
    />
  );
}

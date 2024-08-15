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
  const [error, setError] = useState(undefined);
  const [formState, setFormState] = useState(formData ?? {});
  const [isCreatingState, setIsCreatingState] = useState(isCreating);
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const queryString = serializeSearchParams(searchParams);

  return (
    <SingleStepTaskListForm
      error={error}
      schema={schema}
      uiSchema={uiSchema}
      formData={formState}
      mode={isCreatingState ? FormMode.CREATE : FormMode.READ_ONLY}
      onSubmit={async (data: { formData?: any }) => {
        const updatedFormData = { ...formState, ...data.formData };
        setFormState(updatedFormData);

        const body = {
          ...updatedFormData,
          operation_id: params.operationId,
        };

        const method = isCreatingState ? "POST" : "PUT";
        const endpoint = isCreatingState
          ? "registration/facilities"
          : `registration/facilities/${formState.id}`;
        const pathToRevalidate = isCreatingState
          ? `/operations/${params.operationId}/facilities`
          : `/operations/${params.operationId}/facilities/${formState.id}`;

        const response = await actionHandler(
          endpoint,
          method,
          pathToRevalidate,
          {
            body: JSON.stringify(isCreatingState ? [body] : body),
          },
        );

        if (response?.error) {
          setError(response.error);
          return { error: response.error };
        }

        if (isCreatingState) {
          setFormState((prevState) => ({
            ...prevState,
            id: response[0].id,
          }));
          setIsCreatingState(false);
        }

        const facilityId = isCreatingState ? response[0].id : formState.id;
        const facilityName = isCreatingState ? response[0].name : response.name;
        const replaceUrl = `/administration/operations/${params.operationId}/facilities/${facilityId}${queryString}&facilities_title=${facilityName}`;
        window.history.replaceState(null, "", replaceUrl);
      }}
      onCancel={() =>
        router.replace(
          `/operations/${params.operationId}/facilities${queryString}`,
        )
      }
    />
  );
}

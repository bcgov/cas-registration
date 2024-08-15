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
  const [formState, setFormState] = useState(formData ?? {});
  const [isCreatingState, setIsCreatingState] = useState(isCreating);
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  // 🛸 build the route url with breadcrumbs pattern
  const queryString = serializeSearchParams(searchParams);

  return (
    <SingleStepTaskListForm
      error={error}
      schema={schema}
      uiSchema={uiSchema}
      formData={formData}
      mode={isCreatingState ? FormMode.CREATE : FormMode.READ_ONLY}
      onSubmit={async (data: { formData?: any }) => {
        // Reset error state on form submission
        setError(undefined);
        const method = isCreatingState ? "POST" : "PUT";
        const endpoint = isCreatingState
          ? "registration/facilities"
          : `registration/facilities/${formData?.id}`;
        const pathToRevalidate = isCreatingState
          ? `/operations/${params.operationId}/facilities`
          : `/operations/${params.operationId}/facilities/${formData?.id}`;

        const body = {
          ...data.formData,
          operation_id: params.operationId,
        };
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
          // return error so SingleStepTaskList can re-enable the submit button and user can attempt to submit again
          return { error: response.error };
        } else {
          // Update formState with the new ID from the response
          const updatedFormState = {
            ...formState, // Retain the current form state
            ...data.formData, // Merge in the form data
            id: response.id, // Add the ID from the response
          };

          // Set the updated form state
          setFormState(updatedFormState);
        }
        if (isCreatingState) {
          setIsCreatingState(false);
          window.history.replaceState(
            null,
            "",
            `/administration/operations/${params.operationId}/facilities/${response[0].id}?facilities_title=${response[0].name}`,
          );
        }
      }}
      onCancel={() =>
        router.replace(
          `/operations/${params.operationId}/facilities${queryString}`,
        )
      }
    />
  );
}

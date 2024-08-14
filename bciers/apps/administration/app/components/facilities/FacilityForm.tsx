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

  // 🛸 build the route URL with breadcrumbs pattern
  const params = useParams();
  const searchParams = useSearchParams();
  const queryString = serializeSearchParams(searchParams);

  return (
    <SingleStepTaskListForm
      error={error}
      schema={schema}
      uiSchema={uiSchema}
      formData={formState} // Use formState instead of formData to ensure updates are reflected
      mode={isCreatingState ? FormMode.CREATE : FormMode.READ_ONLY}
      onSubmit={async (data: { formData?: any }) => {
        // Reset error state on form submission
        setError(undefined);
        const method = isCreatingState ? "POST" : "PUT";
        const endpoint = isCreatingState
          ? "registration/facilities"
          : `registration/facilities/${formState.id}`;
        const pathToRevalidate = isCreatingState
          ? `/operations/${params.operationId}/facilities`
          : `/operations/${params.operationId}/facilities/${formState.id}`;
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
          // Return error so SingleStepTaskList can re-enable the submit button
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
            `/administration/operations/${params.operationId}/facilities/${response.id}${queryString}&facilities_title=${response.name}`,
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

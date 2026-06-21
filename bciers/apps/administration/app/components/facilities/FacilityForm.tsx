"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { IChangeEvent } from "@rjsf/core";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import SingleStepTaskListForm from "@bciers/components/form/SingleStepTaskListForm";
import { actionHandler } from "@bciers/actions";
import serializeSearchParams from "@bciers/utils/src/serializeSearchParams";
import {
  FacilityTypes,
  FrontEndRoles,
  FormMode,
} from "@bciers/utils/src/enums";
import { useSessionRole } from "@bciers/utils/src/sessionUtils";
import { FacilityFormData } from "./types";

interface Props {
  schema: RJSFSchema;
  uiSchema: UiSchema;
  formData: FacilityFormData;
  isCreating?: boolean;
}

export default function FacilityForm({
  formData,
  schema,
  uiSchema,
  isCreating,
}: Readonly<Props>) {
  const role = useSessionRole();
  const [error, setError] = useState<string | undefined>(undefined);
  const [formState, setFormState] = useState(formData);
  const [isCreatingState, setIsCreatingState] = useState(isCreating);
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const queryString = serializeSearchParams(searchParams);
  const isSfo = formState.type === FacilityTypes.SFO;
  const isCasDirector = role === FrontEndRoles.CAS_DIRECTOR;
  const canEdit = !role.includes("cas_");

  return (
    <SingleStepTaskListForm
      error={error}
      schema={schema}
      uiSchema={uiSchema}
      formData={formState}
      formContext={{
        facilityId: formData.id,
        isCasDirector,
        isSfo,
      }}
      allowEdit={canEdit}
      mode={isCreatingState ? FormMode.CREATE : FormMode.READ_ONLY}
      onSubmit={async (data: IChangeEvent) => {
        const updatedFormData = { ...formState, ...data.formData };
        setFormState(updatedFormData);

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
            body: JSON.stringify(isCreatingState ? [body] : body),
          },
        );

        if (response?.error) {
          setError(response.error);
          return { error: response.error };
        } else setError(undefined);

        if (isCreatingState) {
          setIsCreatingState(false);
          setFormState((prevState) => ({
            ...prevState,
            id: response[0].id,
          }));
        }

        const facilityId = isCreatingState ? response[0].id : formState.id;
        const facilityName = isCreatingState ? response[0].name : response.name;
        const replaceUrl = `/administration/operations/${params.operationId}/facilities/${facilityId}${queryString}&facilities_title=${facilityName}`;
        window.history.replaceState(null, "", replaceUrl);
      }}
      onCancel={() =>
        router.replace(
          isSfo
            ? `/operations`
            : `/operations/${params.operationId}/facilities${queryString}`,
        )
      }
    />
  );
}

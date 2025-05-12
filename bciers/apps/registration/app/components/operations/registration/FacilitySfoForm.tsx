"use client";

import { useCallback, useState } from "react";
import { UUID } from "crypto";
import { IChangeEvent } from "@rjsf/core";
import { RJSFSchema } from "@rjsf/utils";
import { actionHandler } from "@bciers/actions";
import MultiStepBase from "@bciers/components/form/MultiStepBase";
import {
  facilityInformationSfoSchema,
  facilityInformationSfoUiSchema,
} from "apps/registration/app/data/jsonSchema/operationRegistration/facilityInformation";
import { createUnnestedFormData } from "@bciers/components/form/formDataUtils";
import { facilitiesSfoSchema } from "@/administration/app/data/jsonSchema/facilitiesSfo";

interface FacilitySfoFormProps {
  facilityId?: UUID;
  formData: { [key: string]: any };
  operationId: UUID | "create";
  step: number;
  steps: string[];
  isCreating: boolean;
}

const FacilitySfoForm = ({
  formData,
  operationId,
  step,
  steps,
  facilityId,
  isCreating,
}: FacilitySfoFormProps) => {
  const [formState, setFormState] = useState(formData ?? {});
  // Get the list of sections in the SFO schema - used to unnest the formData
  const formSectionListSfo = Object.keys(
    facilitiesSfoSchema.properties as RJSFSchema,
  );

  const handleFormChange = useCallback(
    (e: IChangeEvent) => {
      setFormState(e.formData);
    },
    [setFormState],
  );

  const handleSubmit = async (e: IChangeEvent) => {
    const method = isCreating ? "POST" : "PUT";

    const endpoint = isCreating
      ? "registration/facilities"
      : `registration/facilities/${facilityId}`;

    const sfoFormData = {
      ...createUnnestedFormData(e.formData, formSectionListSfo),
      operation_id: operationId,
      facility_id: facilityId,
    };

    // We may want to update the PUT route to accept an array of facilities
    // just as we do in the POST route
    const body = isCreating ? [sfoFormData] : sfoFormData;

    const response = await actionHandler(endpoint, method, "", {
      body: JSON.stringify(body),
    });

    if (!response || response?.error) {
      return { error: response.error };
    }
    return response;
  };

  return (
    <MultiStepBase
      allowBackNavigation
      baseUrl={`/register-an-operation/${operationId}`}
      cancelUrl="/"
      formData={formState}
      onChange={handleFormChange}
      onSubmit={handleSubmit}
      schema={facilityInformationSfoSchema}
      step={step}
      steps={steps}
      uiSchema={facilityInformationSfoUiSchema}
    ></MultiStepBase>
  );
};

export default FacilitySfoForm;

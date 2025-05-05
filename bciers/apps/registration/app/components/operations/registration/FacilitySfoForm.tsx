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
}

const FacilitySfoForm = ({
  formData,
  operationId,
  step,
  steps,
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
    const body = [
      {
        ...createUnnestedFormData(e.formData, formSectionListSfo),
        operation_id: operationId,
      },
    ];
    const response = await actionHandler(
      "registration/facilities",
      "POST",
      "",
      {
        body: JSON.stringify(body),
      },
    );
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

"use client";

import { useCallback, useMemo, useState } from "react";
import { UUID } from "crypto";
import { IChangeEvent } from "@rjsf/core";
import { RJSFSchema } from "@rjsf/utils";
import { actionHandler } from "@bciers/actions";
import FacilitiesDataGrid from "apps/administration/app/components/facilities/FacilitiesDataGrid";
import { FacilityInitialData } from "apps/administration/app/components/facilities/types";
import MultiStepBase from "@bciers/components/form/MultiStepBase";
import { facilitiesLfoSchema } from "apps/administration/app/data/jsonSchema/facilitiesLfo";
import {
  facilityInformationLfoSchema,
  facilityInformationSfoSchema,
  facilityInformationLfoUiSchema,
  facilityInformationSfoUiSchema,
} from "apps/registration/app/data/jsonSchema/operationRegistration/facilityInformation";
import { FacilityInformationFormData } from "apps/registration/app/components/operations/registration/types";
import { createUnnestedFormData } from "@bciers/components/form/formDataUtils";

interface FacilityInformationFormProps {
  facilityId?: UUID;
  formData: FacilityInformationFormData;
  initialGridData?: FacilityInitialData;
  isCreating: boolean;
  isOperationSfo: boolean;
  operation: UUID | "create";
  step: number;
  steps: string[];
}

const FacilityGridSx = {
  "& .MuiDataGrid-virtualScroller": {
    minHeight: "60px",
  },
  "& .MuiDataGrid-overlayWrapper": {
    minHeight: "60px",
  },
};

// Unnest the formData objects inside facility_information_array which is split into sections
const createUnnestedArrayFormData = (
  formDataArray: any,
  formSectionList: string[],
  operationId: string,
) => {
  const unnestedFormData: { [key: string]: any }[] = [];
  formDataArray.forEach((formData: { [key: string]: any }) => {
    // Unnest each formData object and add operation_id
    unnestedFormData.push({
      ...createUnnestedFormData(formData, formSectionList),
      operation_id: operationId,
    });
  });
  return unnestedFormData;
};

const FacilityInformationForm = ({
  facilityId,
  formData,
  initialGridData,
  isCreating,
  isOperationSfo,
  operation,
  step,
  steps,
}: FacilityInformationFormProps) => {
  const [error, setError] = useState(undefined);
  const [formState, setFormState] = useState(formData ?? {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Get the list of sections in the LFO schema - used to unnest the formData
  const formSectionListLFo = Object.keys(
    facilitiesLfoSchema.properties as RJSFSchema,
  );

  const schema = isOperationSfo
    ? facilityInformationSfoSchema
    : facilityInformationLfoSchema;
  const uiSchema = isOperationSfo
    ? facilityInformationSfoUiSchema
    : facilityInformationLfoUiSchema;

  const FacilityDataGridMemo = useMemo(
    () => (
      <FacilitiesDataGrid
        disabled={isSubmitting}
        initialData={initialGridData ?? { rows: [], row_count: 0 }}
        operationId={operation}
        sx={FacilityGridSx}
      />
    ),
    [initialGridData, isSubmitting, operation],
  );

  const handleFormChange = useCallback(
    (e: IChangeEvent) => {
      setFormState(e.formData);
    },
    [setFormState],
  );

  const handleSubmit = useCallback(
    async (e: IChangeEvent) => {
      setIsSubmitting(true);
      const method = isCreating ? "POST" : "PUT";
      const endpoint = isCreating
        ? "registration/facilities"
        : `registration/facilities/${facilityId}`;

      const sfoFormData = isOperationSfo && {
        ...createUnnestedFormData(e.formData, formSectionListLFo),
        operation_id: operation,
        facility_id: facilityId,
      };

      // We may want to update the PUT route to accept an array of facilities
      // just as we do in the POST route
      const sfoBody = isCreating ? [sfoFormData] : sfoFormData;

      const body = isOperationSfo
        ? sfoBody
        : // Facilities POST route expects an array of facilities
          createUnnestedArrayFormData(
            e.formData.facility_information_array,
            formSectionListLFo,
            operation,
          );

      const response = await actionHandler(endpoint, method, "", {
        body: JSON.stringify(body),
      });
      if (response.error) {
        setError(response.error);
        setIsSubmitting(false);
        return { error: response.error };
      }
    },
    [operation, isOperationSfo, formSectionListLFo, isCreating, facilityId],
  );

  return (
    <MultiStepBase
      allowBackNavigation
      baseUrl={`/register-an-operation/${operation}`}
      baseUrlParams="title=Placeholder+Title"
      cancelUrl="/"
      formData={formState}
      onChange={handleFormChange}
      onSubmit={handleSubmit}
      error={error}
      schema={schema}
      step={step}
      steps={steps}
      uiSchema={uiSchema}
    >
      {/* Only display DataGrid for LFO Operations */}
      {!isOperationSfo && (
        <section className="mt-4">{FacilityDataGridMemo}</section>
      )}
    </MultiStepBase>
  );
};

export default FacilityInformationForm;

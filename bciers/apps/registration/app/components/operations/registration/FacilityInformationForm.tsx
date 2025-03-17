"use client";

import { useCallback, useMemo, useState } from "react";
import { UUID } from "crypto";
import { IChangeEvent } from "@rjsf/core";
import { RJSFSchema } from "@rjsf/utils";
import { actionHandler } from "@bciers/actions";
import FacilitiesDataGrid from "apps/administration/app/components/facilities/FacilitiesDataGrid";
import { FacilityInitialData } from "apps/administration/app/components/facilities/types";
import MultiStepBase from "@bciers/components/form/MultiStepBase";
import {
  facilityInformationLfoSchema,
  facilityInformationSfoSchema,
  facilityInformationLfoUiSchema,
  facilityInformationSfoUiSchema,
} from "apps/registration/app/data/jsonSchema/operationRegistration/facilityInformation";
import { FacilityInformationFormData } from "apps/registration/app/components/operations/registration/types";
import { createUnnestedFormData } from "@bciers/components/form/formDataUtils";
import { facilitiesSfoSchema } from "@/administration/app/data/jsonSchema/facilitiesSfo";

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
    // if facility form is blank (a user clicked "Add Facility" but didn't fill anything), do nothing
    if (Object.keys(formData).length === 0) {
      return;
    }
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
  const [formState, setFormState] = useState(formData ?? {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Get the list of sections in the LFO schema - used to unnest the formData
  const formSectionListSfo = Object.keys(
    facilitiesSfoSchema.properties as RJSFSchema,
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

  const redirect = () => {
    // Using window.location.href instead of MutliStepBase router.push as there were rerender issues due to
    // Facility Grid listerning to params change on this page which sometimes hijacked the route change
    window.location.href = `${
      window.location.origin
    }/registration/register-an-operation/${operation}/${step + 1}`;
  };

  const handleSubmit = useCallback(
    async (e: IChangeEvent) => {
      // if there are no existing facilities and the user hasn't added a new one, return error
      if (
        initialGridData?.row_count === 0 &&
        ((e.formData?.facility_information_array &&
          e.formData.facility_information_array.length === 0) ||
          JSON.stringify(e.formData.facility_information_array) ===
            JSON.stringify([{}]))
      ) {
        return { error: "Operation must have at least one facility." };
      }
      // if there's an existing facility and the new facility form was opened but not filled, redirect to the next step without hitting the API
      if (initialGridData?.row_count && initialGridData?.row_count > 0) {
        redirect();
        return;
      }
      setIsSubmitting(true);
      const method = isCreating ? "POST" : "PUT";

      const endpoint = isCreating
        ? "registration/facilities"
        : `registration/facilities/${facilityId}`;
      const sfoFormData = isOperationSfo && {
        ...createUnnestedFormData(e.formData, formSectionListSfo),
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
            formSectionListSfo,
            operation,
          );

      const response = await actionHandler(endpoint, method, "", {
        body: JSON.stringify(body),
      }).then((resolve) => {
        if (resolve?.error) {
          // errors are handled in MultiStepBase
          return { error: resolve.error };
        } else {
          redirect();
        }
      });

      return response;
    },
    [operation, isOperationSfo, formSectionListSfo, isCreating, facilityId],
  );

  return (
    <MultiStepBase
      allowBackNavigation
      baseUrl={`/register-an-operation/${operation}`}
      cancelUrl="/"
      formData={formState}
      onChange={handleFormChange}
      onSubmit={handleSubmit}
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

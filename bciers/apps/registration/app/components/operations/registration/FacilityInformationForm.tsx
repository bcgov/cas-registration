"use client";

import { useCallback, useMemo, useState } from "react";
import { IChangeEvent } from "@rjsf/core";
import { RJSFSchema } from "@rjsf/utils";
import { actionHandler } from "@bciers/actions";
import FacilityDataGrid from "apps/administration/app/components/facilities/FacilityDataGrid";
import { FacilityInitialData } from "apps/administration/app/components/facilities/types";
import MultiStepBase from "@bciers/components/form/MultiStepBase";
import { facilitiesSchemaLfo } from "@/administration/app/data/jsonSchema/facilitiesLfo";
import {
  facilityInfoLfoUiSchema,
  facilityInfoSfoUiSchema,
} from "apps/registration/app/data/jsonSchema/operationRegistration/facilityInformation";
import {
  FacilityInformationFormData,
  OperationRegistrationFormProps,
} from "apps/registration/app/components/operations/registration/types";
import { createUnnestedFormData } from "@bciers/components/form/formDataUtils";

interface FacilityInformationFormProps extends OperationRegistrationFormProps {
  formData: FacilityInformationFormData;
  initialGridData: FacilityInitialData;
  isSfo: boolean;
}

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
  formData,
  initialGridData,
  isSfo,
  operation,
  schema,
  step,
  steps,
}: FacilityInformationFormProps) => {
  const [error, setError] = useState(undefined);
  const [formState, setFormState] = useState(formData ?? {});
  const formSectionListLFo = Object.keys(
    facilitiesSchemaLfo.properties as RJSFSchema,
  );

  const FacilityDataGridMemo = useMemo(
    () => (
      <FacilityDataGrid
        operationId="002d5a9e-32a6-4191-938c-2c02bfec592d"
        initialData={initialGridData ?? { rows: [], row_count: 0 }}
      />
    ),
    [initialGridData],
  );

  const handleFormChange = useCallback(
    (e: IChangeEvent) => {
      setFormState(e.formData);
    },
    [setFormState],
  );

  const handleSubmit = useCallback(
    async (e: IChangeEvent) => {
      const method = "POST";
      const endpoint = isSfo
        ? "registration/facility"
        : "registration/facilities";

      const body = isSfo
        ? {
            ...createUnnestedFormData(e.formData, formSectionListLFo),
            operation_id: operation,
          }
        : createUnnestedArrayFormData(
            e.formData.facility_information_array,
            formSectionListLFo,
            operation,
          );
      const response = await actionHandler(endpoint, method, "", {
        body: JSON.stringify(body),
      });
      if (response.error) {
        setError(response.error);
        return { error: response.error };
      }
    },
    [operation],
  );

  return (
    <MultiStepBase
      allowBackNavigation
      baseUrl={`/operation/${operation}`}
      baseUrlParams="title=Placeholder+Title"
      cancelUrl="/"
      formData={formState}
      onChange={handleFormChange}
      onSubmit={handleSubmit}
      error={error}
      schema={schema}
      step={step}
      steps={steps}
      uiSchema={isSfo ? facilityInfoSfoUiSchema : facilityInfoLfoUiSchema}
    >
      {FacilityDataGridMemo}
    </MultiStepBase>
  );
};

export default FacilityInformationForm;

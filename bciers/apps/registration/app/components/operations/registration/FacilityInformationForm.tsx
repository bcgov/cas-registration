"use client";

import { useCallback, useMemo, useState } from "react";
import { IChangeEvent } from "@rjsf/core";
import { RJSFSchema } from "@rjsf/utils";
import { actionHandler } from "@bciers/actions";
import FacilityDataGrid from "apps/administration/app/components/facilities/FacilityDataGrid";
import { FacilityInitialData } from "apps/administration/app/components/facilities/types";
import MultiStepBase from "@bciers/components/form/MultiStepBase";
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

// const createUnnestedArrayFormData = (
//   formData: any,
//   formSectionList: string[],
// ) => {
//   const unnestedFormData: any = {};
//   formSectionList.forEach((section) => {
//     unnestedFormData[section] = formData[section];
//   });
//   return unnestedFormData;
// };

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
  const formSections = schema.properties as RJSFSchema;
  const formSectionList = Object.keys(formSections);

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
      const endpoint = isSfo ? "registration/facilities" : "tbd";

      const formDataUnnested = isSfo
        ? createUnnestedFormData(e.formData, formSectionList)
        : {};

      const body = {
        ...formDataUnnested,
        operation_id: operation,
      };
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

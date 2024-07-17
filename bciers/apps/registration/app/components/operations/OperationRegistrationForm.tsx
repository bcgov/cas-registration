"use client";

import {useCallback, useMemo, useState } from "react";
import { UUID } from "crypto";
import MultiStepFormBase from "@bciers/components/form/MultiStepFormBase";
import { useRouter } from "next/navigation";
import { RJSFSchema } from "@rjsf/utils";
import { IChangeEvent } from "@rjsf/core";
import FacilityDataGrid from "apps/administration/app/components/facilities/FacilityDataGrid";
import { operationRegistrationUiSchema } from "apps/registration/app/data/jsonSchema/operationRegistration";
import { FacilityInitialData } from "apps/administration/app/components/facilities/types";
import { OperationRegistrationFormData } from "apps/registration/app/components/operations/types";

interface Props {
  schema: RJSFSchema;
  formData?: OperationRegistrationFormData;
  formSection: number;
  facilityInitialData?: FacilityInitialData;
  operation: UUID | "create";
}

const OperationRegistrationForm = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  facilityInitialData,
  formData,
  formSection,
  operation,
  schema,
}: Readonly<Props>) => {
  const [error, setError] = useState(undefined);
  const [formState, setFormState] = useState(formData ?? {});
  const router = useRouter();
  const formSectionList = schema.properties && Object.keys(schema.properties);
  const isNotFinalStep = formSection !== formSectionList?.length;

  const handleSubmit = async () => {
    // This will have to be pulled from the response after the first page
    const OPERATION_ID = "002d5a9e-32a6-4191-938c-2c02bfec592d";
    // This will have to be pulled from the response after the second page
    const OPERATION_NAME = "Operation name placeholder";

    const nextStepUrl = `/operation/${OPERATION_ID}/${
      formSection + 1
    }?title=${OPERATION_NAME}`;

    if (isNotFinalStep) {
      router.push(nextStepUrl);
    }
  };

  const isFacilityDataGrid = formSection === 3;

  // Momoize the FacilityDataGrid component
  const FacilityDataGridMemo = useMemo(
    () => (
      <>
        {isFacilityDataGrid && (
          <FacilityDataGrid
            operationId="002d5a9e-32a6-4191-938c-2c02bfec592d"
            initialData={{ rows: [], row_count: 0 }}
          />
        )}
      </>
    ),
    [facilityInitialData, operationId, isFacilityDataGrid],
  );

  const handleFormChange = useCallback(
    (e: IChangeEvent) => {
      setFormState(e.formData);
    },
    [setFormState],
  );

  return (
    <MultiStepFormBase
      baseUrl={`/operation/${operation}`}
      cancelUrl="/"
      schema={schema}
      uiSchema={operationRegistrationUiSchema}
      formData={formState}
      error={error}
      // Only use controlled state for the FacilityDataGrid page
      // since it can cause laggy form updates
      onChange={isFacilityDataGrid ? handleFormChange : undefined}
      setErrorReset={setError}
      allowBackNavigation
      onSubmit={handleSubmit}
    >
      {FacilityDataGridMemo}
    </MultiStepFormBase>
  );
};

export default OperationRegistrationForm;

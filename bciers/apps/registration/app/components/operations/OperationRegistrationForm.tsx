"use client";

import { useCallback, useMemo, useState } from "react";
import MultiStepFormBase from "@bciers/components/form/MultiStepFormBase";
import { useParams, useRouter } from "next/navigation";
import { RJSFSchema } from "@rjsf/utils";
import { operationRegistrationUiSchema } from "apps/registration/app/data/jsonSchema/operationRegistration";
import FacilityDataGrid from "apps/administration/app/components/facilities/FacilityDataGrid";
import { FacilityInitialData } from "apps/administration/app/components/facilities/types";
import { IChangeEvent } from "@rjsf/core";

interface Props {
  schema: RJSFSchema;
  formData?: any;
  facilityInitialData?: FacilityInitialData;
}

const OperationRegistrationForm = ({
  facilityInitialData,
  formData,
  schema,
}: Readonly<Props>) => {
  const [error, setError] = useState(undefined);
  const [formState, setFormState] = useState(formData ?? {});
  const router = useRouter();
  const params = useParams();
  const formSection = parseInt(params?.formSection.toString());
  const operationId = params?.operation.toString();
  const formSectionList = schema.properties && Object.keys(schema.properties);
  const isNotFinalStep = formSection !== formSectionList?.length;

  const handleSubmit = async () => {
    // This will have to be pulled from the response after the first page
    const OPERATION_ID = "002d5a9e-32a6-4191-938c-2c02bfec592d";
    const OPERATION_NAME = "Operation name placeholder";

    const nextStepUrl = `/operation/${OPERATION_ID}/${
      formSection + 1
    }?title=${OPERATION_NAME}`;

    if (isNotFinalStep) {
      // Simulate next/link click
      // Had to use this to move past the facility grid page as I believe router change causes a rerender
      // and makes the useEffect in DataGrid fire again
      // const link = document.createElement("a");
      // link.href = nextStepUrl;
      // link.click();
      router.push(nextStepUrl);
      // window.history.replaceState({ ...window.history.state }, "", nextStepUrl);
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
      baseUrl={`/operation/${operationId}`}
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

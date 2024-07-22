"use client";

import { useState } from "react";
import MultiStepFormBase from "@bciers/components/form/MultiStepFormBase";
import { useParams, useRouter } from "next/navigation";
import { RJSFSchema } from "@rjsf/utils";
import { operationRegistrationUiSchema } from "apps/registration/app/data/jsonSchema/operationRegistration";
import { FacilityInitialData } from "apps/administration/app/components/facilities/types";

interface Props {
  schema: RJSFSchema;
  formData?: any;
  facilityInitialData?: FacilityInitialData;
}

const OperationRegistrationForm = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  facilityInitialData,
  formData,
  schema,
}: Readonly<Props>) => {
  const [error, setError] = useState(undefined);
  const router = useRouter();
  const params = useParams();
  const formSection = parseInt(params?.formSection.toString());
  const operationId = params?.operation.toString();
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

  return (
    <MultiStepFormBase
      baseUrl={`/operation/${operationId}`}
      cancelUrl="/"
      schema={schema}
      uiSchema={operationRegistrationUiSchema}
      formData={formData}
      error={error}
      setErrorReset={setError}
      allowBackNavigation
      onSubmit={handleSubmit}
    />
  );
};

export default OperationRegistrationForm;

"use client";

import { useState } from "react";
import MultiStepFormBase from "@bciers/components/form/MultiStepFormBase";
import { useParams, useRouter } from "next/navigation";
import { RJSFSchema } from "@rjsf/utils";
import { operationRegistrationUiSchema } from "apps/registration/app/data/jsonSchema/operationRegistration";

interface Props {
  schema: RJSFSchema;
  formData?: any;
}

const OperationRegistrationForm = ({ formData, schema }: Readonly<Props>) => {
  const [error, setError] = useState(undefined);
  const router = useRouter();
  const params = useParams();
  const formSection = parseInt(params?.formSection as string);
  const operationId = params?.operation;
  const formSectionList = schema.properties && Object.keys(schema.properties);
  const isNotFinalStep = formSection !== formSectionList?.length;

  const handleSubmit = async () => {
    // This will have to be pulled from the response after the first page
    const NEW_OPERATION_ID = "8be4c7aa-6ab3-4aad-9206-0ef914fea063";

    if (isNotFinalStep) {
      router.push(
        `/operation/${NEW_OPERATION_ID}/${
          formSection + 1
        }?title=Operation name placeholder`,
      );
    }
  };

  return (
    <MultiStepFormBase
      baseUrl={`operation/${operationId}`}
      cancelUrl="/"
      schema={schema}
      // Use showSubmissionStep prop or use actual form page?
      showSubmissionStep
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

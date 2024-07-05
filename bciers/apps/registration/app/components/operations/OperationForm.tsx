"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SingleStepTaskListForm from "@bciers/components/form/SingleStepTaskListForm";
import { RJSFSchema } from "@rjsf/utils";
import { operationUiSchema } from "../../data/jsonSchema/operation";
import { OperationFormData } from "./types";
import { actionHandler } from "@bciers/actions";

const OperationForm = ({ schema }: { schema: RJSFSchema }) => {
  const [error, setError] = useState(undefined);

  const router = useRouter();

  const handleSubmit = async (data: { formData?: OperationFormData }) => {
    const formData = data.formData;

    const response = await actionHandler(
      "registration/v2/operations",
      "POST",
      "",
      {
        body: JSON.stringify(formData),
      },
    );

    if (response.error) {
      setError(response.error);
      return { error: response.error };
    }
  };

  return (
    <SingleStepTaskListForm
      error={error}
      schema={schema}
      uiSchema={operationUiSchema}
      formData={{}}
      onSubmit={handleSubmit}
      onCancel={() => router.push("/registration/operations")}
    />
  );
};

export default OperationForm;

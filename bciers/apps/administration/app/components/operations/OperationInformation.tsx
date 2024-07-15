"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SingleStepTaskListForm from "@bciers/components/form/SingleStepTaskListForm";
import { RJSFSchema } from "@rjsf/utils";
import { operationUiSchema } from "../../data/jsonSchema/operation";
import { OperationFormData } from "./types";
import { actionHandler } from "@bciers/actions";

const OperationForm = ({
  formData,
  schema,
}: {
  formData: OperationFormData;
  schema: RJSFSchema;
}) => {
  const [error, setError] = useState(undefined);

  const router = useRouter();

  const handleSubmit = async (data: { formData?: OperationFormData }) => {
    // This is not currently working, just a placeholder for Edit Operation Information PR
    const response = await actionHandler(
      "registration/v2/operations",
      "PUT",
      "",
      {
        body: JSON.stringify(data.formData),
      },
    );

    if (response.error) {
      setError(response.error);
      return { error: response.error };
    }
  };

  return (
    <SingleStepTaskListForm
      disabled
      error={error}
      schema={schema}
      uiSchema={operationUiSchema}
      formData={formData ?? {}}
      onSubmit={handleSubmit}
      onCancel={() => router.push("/operations")}
    />
  );
};

export default OperationForm;

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { UUID } from "crypto";
import SingleStepTaskListForm from "@bciers/components/form/SingleStepTaskListForm";
import { RJSFSchema } from "@rjsf/utils";
import { administrationOperationInformationUiSchema } from "../../data/jsonSchema/operationInformation/administrationOperationInformation";
import {
  OperationInformationFormData,
  OperationInformationPartialFormData,
} from "./types";
import { actionHandler } from "@bciers/actions";
import { FormMode } from "@bciers/utils/enums";

const OperationInformationForm = ({
  formData,
  operationId,
  schema,
}: {
  formData: OperationInformationPartialFormData;
  operationId: UUID;
  schema: RJSFSchema;
}) => {
  const [error, setError] = useState(undefined);

  const router = useRouter();
  const { data: session } = useSession();

  const isIndustryUser = session?.user?.app_role?.includes("industry");

  const handleSubmit = async (data: {
    formData?: OperationInformationFormData;
  }) => {
    const response = await actionHandler(
      `registration/v2/operations/${operationId}`,
      "PUT",
      "",
      {
        body: JSON.stringify(data.formData),
      },
    );

    if (response?.error) {
      setError(response.error);
      return { error: response.error };
    }

    if (!data.formData?.opted_in_operation) return;
    const response2 = await actionHandler(
      `registration/v2/operations/${operationId}/registration/opted-in-operation-detail`,
      "PUT",
      "",
      {
        body: JSON.stringify(data.formData?.opted_in_operation),
      },
    );

    if (response2?.error) {
      setError(response2.error);
      return { error: response2.error };
    }
  };

  return (
    <SingleStepTaskListForm
      allowEdit={isIndustryUser}
      mode={FormMode.READ_ONLY}
      error={error}
      schema={schema}
      uiSchema={administrationOperationInformationUiSchema}
      formData={formData ?? {}}
      onSubmit={handleSubmit}
      onCancel={() => router.push("/operations")}
    />
  );
};

export default OperationInformationForm;

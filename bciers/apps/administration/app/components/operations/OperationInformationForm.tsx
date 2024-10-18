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
import { FormMode, FrontEndRoles } from "@bciers/utils/enums";

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

  // To get the user's role from the session
  const { data: session } = useSession();
  const role = session?.user?.app_role ?? "";

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
  };

  return (
    <SingleStepTaskListForm
      allowEdit={role === FrontEndRoles.INDUSTRY_USER_ADMIN}
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

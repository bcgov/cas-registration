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
import { FormMode, FrontEndRoles } from "@bciers/utils/src/enums";
import { RegistrationPurposes, regulatedOperationPurposes } from "apps/registration/app/components/operations/registration/enums";

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
  const isAuthorizedAdminUser = [
    FrontEndRoles.CAS_ADMIN,
    FrontEndRoles.CAS_ANALYST,
  ].includes(role as FrontEndRoles);

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
      allowEdit={role === FrontEndRoles.INDUSTRY_USER_ADMIN}
      mode={FormMode.READ_ONLY}
      error={error}
      schema={schema}
      uiSchema={administrationOperationInformationUiSchema}
      formData={formData ?? {}}
      onSubmit={handleSubmit}
      onCancel={() => router.push("/operations")}
      formContext={{
        operationId,
        isInternalUser: isAuthorizedAdminUser,
        isRegulatedOperation: regulatedOperationPurposes.includes(
          formData.registration_purpose as RegistrationPurposes,
        ),
        status: formData.status,
      }}
    />
  );
};

export default OperationInformationForm;

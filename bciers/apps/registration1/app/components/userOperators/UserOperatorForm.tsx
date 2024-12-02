"use client";

import { RJSFSchema } from "@rjsf/utils";
import { useState } from "react";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { actionHandler } from "@bciers/actions";
import { useSession } from "next-auth/react";
import MultiStepFormBase from "apps/registration1/app/components/form/MultiStepFormBase";
import { UserOperatorFormData } from "@/app/components/form/formDataTypes";
import Note from "@bciers/components/datagrid/Note";
import { Status } from "@bciers/utils/src/enums";
import { userOperatorUiSchema } from "@/app/utils/jsonSchema/userOperator";

interface UserOperatorFormProps {
  readonly schema: RJSFSchema;
  readonly formData: Partial<UserOperatorFormData>;
}
export default function UserOperatorForm({
  schema,
  formData,
}: UserOperatorFormProps) {
  const { data: session } = useSession();
  const { push } = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  const [error, setError] = useState(undefined);
  const formSection =
    parseInt(params?.formSection as string) ||
    parseInt(searchParams.get("form-section") as string);
  const isCreate = pathname.includes("create");
  const isRequestingAccess = pathname.includes("request");

  const userOperatorId = params?.id as string;
  const submitHandler = async (data: { formData?: UserOperatorFormData }) => {
    const newFormData = {
      ...data.formData,
    } as UserOperatorFormData;

    const endpoint = `registration/v1/user-operators${
      !isCreate ? `/${userOperatorId}` : ""
    }`;
    const response = await actionHandler(
      endpoint,
      isCreate ? "POST" : "PUT",
      `/dashboard/select-operator/user-operator/${
        isCreate ? "create" : userOperatorId
      }/${formSection}`,
      {
        body: JSON.stringify(newFormData),
      },
    );
    if (response.error) {
      setError(response.error);
      // return error so MultiStepFormBase can re-enable the submit button
      // and user can attempt to submit again
      return { error: response.error };
    }
    if (isCreate) {
      return push(
        `/dashboard/select-operator/received/add-operator/${response.operator_id}`,
      );
    }

    if (isRequestingAccess) {
      return push(
        `/dashboard/select-operator/received/request-access/${response.operator_id}`,
      );
    }
    return push(`/dashboard`);
  };

  // page flashes if !isCasInternal or !isIndustryUser is used
  const isCasInternal =
    session?.user?.app_role?.includes("cas") &&
    !session?.user?.app_role?.includes("pending");
  const isIndustryUser = session?.user?.app_role?.includes("industry");

  const isFormStatusDisabled =
    formData?.status === Status.PENDING || formData?.status === Status.APPROVED;

  const operatorRoute = isCasInternal ? "operators" : "select-operator";

  const confirmationMessage = (
    <>
      Please click on the &quot;Edit Information&quot; button, fill out missing
      information or update incorrect information about your operator, and then
      click on the &quot;Save and Return to Dashboard&quot; button to confirm
      the completeness and accuracy. <br />
      Some fields cannot be edited. If you need to change those fields, please
      contact us via email at{" "}
      <a href="mailto:GHGRegulator@gov.bc.ca">GHGRegulator@gov.bc.ca</a>.
    </>
  );

  return (
    <>
      {isIndustryUser && (
        <Note
          classNames={"mb-4 mt-6"}
          showNotePrefix={false}
          showAlertIcon={true}
          message={confirmationMessage}
        />
      )}
      <MultiStepFormBase
        cancelUrl={
          isCasInternal ? "/dashboard/operators" : "/dashboard/select-operator"
        }
        allowEdit={isFormStatusDisabled && isIndustryUser}
        allowBackNavigation
        baseUrl={`/dashboard/${operatorRoute}/user-operator/${
          isCreate ? "create" : userOperatorId
        }`}
        schema={schema}
        disabled={isCasInternal || isFormStatusDisabled}
        error={error}
        setErrorReset={setError}
        formData={formData}
        onSubmit={submitHandler}
        submitButtonText={isCreate ? "Submit" : "Save and Return to Dashboard"}
        uiSchema={userOperatorUiSchema}
      />
    </>
  );
}

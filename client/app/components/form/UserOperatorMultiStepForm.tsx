"use client";

import { RJSFSchema } from "@rjsf/utils";
import { useState } from "react";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { userOperatorUiSchema } from "@/app/utils/jsonSchema/userOperator";
import { actionHandler } from "@/app/utils/actions";
import { useSession } from "next-auth/react";
import UserOperatorReview from "@/app/components/routes/access-requests/form/UserOperatorReview";
import MultiStepFormBase from "@/app/components/form/MultiStepFormBase";
import { UserOperatorFormData } from "@/app/components/form/formDataTypes";
import Note from "../datagrid/Note";
import { Status } from "@/app/utils/enums";

interface UserOperatorFormProps {
  readonly schema: RJSFSchema;
  readonly formData: Partial<UserOperatorFormData>;
}

export default function UserOperatorMultiStepForm({
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

  const formSectionIndex = formSection - 1;

  const formSectionList = Object.keys(schema.properties as RJSFSchema);
  const isFinalStep = formSectionIndex === formSectionList.length - 1;

  const userOperatorId = params?.id as string;

  const userOperatorIdParam = searchParams?.get("user-operator-id");
  const submitHandler = async (data: { formData?: UserOperatorFormData }) => {
    const newFormData = {
      ...data.formData,
    } as UserOperatorFormData;

    // add user operator id to form data if it exists (to be used in senior officer creation)
    if (userOperatorId)
      newFormData.user_operator_id = userOperatorIdParam || userOperatorId;

    const apiUrl = `registration/user-operator/${
      isFinalStep ? "contact" : "operator"
    }`;

    const response = await actionHandler(
      `${apiUrl}${!isCreate && !isFinalStep ? `/${userOperatorId}` : ""}`,
      isCreate || isFinalStep ? "POST" : "PUT",
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

    if (isFinalStep) {
      push(
        `/dashboard/select-operator/received/add-operator/${response.operator_id}`,
      );
      return;
    }

    // continue to use user-operator-id search param for create route since database will error if sending a user operator id
    // in the /[id] route as the user doesn't exist yet
    return push(
      `/dashboard/select-operator/user-operator/${
        isCreate ? "create" : userOperatorId
      }/${formSection + 1}${
        isCreate ? `?user-operator-id=${response.user_operator_id}` : ""
      }`,
    );
  };

  const isCasInternal =
    session?.user.app_role?.includes("cas") &&
    !session?.user.app_role?.includes("pending");

  const isFormStatusDisabled =
    formData?.status === Status.PENDING || formData?.status === Status.APPROVED;

  const operatorRoute = isCasInternal ? "operators" : "select-operator";
  // If the user is an approved cas internal user or if no operator exists show the entire multistep form
  if (isCasInternal || !userOperatorId || formSection) {
    return (
      <>
        {isCasInternal && formData.is_new && formSection === 0 && (
          <>
            <Note message="This is a new operator. You must approve this operator before approving its admin." />
            <UserOperatorReview
              userOperator={formData as UserOperatorFormData}
              userOperatorId={Number(userOperatorId)}
              isOperatorNew={formData?.is_new}
              operatorId={formData?.operator_id}
              showRequestChanges
            />
          </>
        )}
        {isCasInternal && formSection === 1 && (
          <UserOperatorReview
            userOperator={formData as UserOperatorFormData}
            userOperatorId={Number(userOperatorId)}
            isOperatorNew={formData?.is_new}
            operatorId={formData?.operator_id}
            // We don't want to show the request changes button for Prime Admin approval
            showRequestChanges={false}
          />
        )}
        <MultiStepFormBase
          cancelUrl={
            isCasInternal
              ? "/dashboard/operators"
              : "/dashboard/select-operator"
          }
          allowEdit={isFormStatusDisabled && !isCasInternal}
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
          uiSchema={userOperatorUiSchema}
        />
      </>
    );
  }
}

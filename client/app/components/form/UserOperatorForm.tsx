"use client";

import { RJSFSchema } from "@rjsf/utils";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@mui/material";
import { userOperatorUiSchema } from "@/app/utils/jsonSchema/userOperator";

import MultiStepFormBase from "@/app/components/form/MultiStepFormBase";
import { createSubmitHandler } from "@/app/utils/actions";
import { UserOperatorFormData } from "@/app/components/form/formDataTypes";

export interface UserOperatorFormProps {
  schema: RJSFSchema;
  formData?: UserOperatorFormData;
  userOperatorId: number;
}

export default function UserOperatorForm({
  schema,
  formData,
  userOperatorId,
}: UserOperatorFormProps) {
  const { push } = useRouter();
  const params = useParams();
  const [error, setError] = useState(undefined);
  const [operatorName, setOperatorName] = useState("");

  const formSection = parseInt(params?.formSection as string) - 1;
  const formSectionList = Object.keys(schema.properties as any);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isFinalStep = formSection === formSectionList.length - 1;

  return (
    <>
      {operatorName ? (
        <section className="w-full text-center text-2xl mt-20">
          <p>
            Your request to access <b>{operatorName}</b> as its Administrator
            has been received.
          </p>
          <p>
            We will review your request as soon as possible! Once approved, you
            will receive a confirmation email.
          </p>
          <p>
            You can then log back in using your Business BCeID with full
            permissions.
          </p>
          <Link href="/dashboard/select-operator">
            <Button variant="contained">View submitted information</Button>
          </Link>
        </section>
      ) : (
        <MultiStepFormBase
          baseUrl={`/dashboard/select-operator/user-operator/${userOperatorId}`}
          cancelUrl="/dashboard/select-operator"
          schema={schema}
          error={error}
          formData={formData}
          showSubmissionStep
          onSubmit={async (data: { formData?: UserOperatorFormData }) => {
            const response = (await createSubmitHandler(
              "PUT",
              `registration/select-operator/user-operator/${userOperatorId}`,
              `/dashboard/select-operator/user-operator/${userOperatorId}`,
              data.formData,
            )) as any;

            if (response.error) {
              setError(response.error);
              return;
            }
            setOperatorName(response.res.operator_name);
            push(
              `/dashboard/select-operator/received/${response.res.operator_id}`,
            );
          }}
          uiSchema={userOperatorUiSchema}
        />
      )}
    </>
  );
}

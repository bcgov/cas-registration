"use client";

import { useState } from "react";
import { operationUiSchema } from "@/app/utils/jsonSchema/operations";
import MultiStepFormBase from "@/app/components/form/MultiStepFormBase";
import { Button } from "@mui/material";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { actionHandler } from "@/app/utils/actions";
import { useSession } from "next-auth/react";
import { Status } from "@/app/utils/enums";

export interface OperationsFormData {
  [key: string]: any;
}

interface Props {
  schema: any;
  formData?: OperationsFormData;
}

export default function OperationsForm({ formData, schema }: Readonly<Props>) {
  const { data: session } = useSession();

  const [operationName, setOperationName] = useState("");
  const [error, setError] = useState(undefined);
  const router = useRouter();
  const params = useParams();
  const formSection = parseInt(params?.formSection as string);
  const operationId = params?.operation;
  const isCreate = params?.operation === "create";

  const formSectionList = Object.keys(schema.properties as any);
  const isNotFinalStep = formSection !== formSectionList.length;
  const isFinalStep = formSection === formSectionList.length;

  return (
    <>
      {operationName ? (
        <section className="w-full text-center text-2xl mt-20">
          <p>
            Your request to register <b>{operationName}</b> has been received.
          </p>
          <p>
            We will review your request as soon as possible! Once approved, you
            will receive a confirmation email.
          </p>
          <p>
            You can then log back and download the declaration form for carbon
            tax exemption for the operation.
          </p>
          <p>
            <Link href="#">Have not received the confirmation email yet?</Link>
          </p>
          <Link href="/dashboard/operations">
            <Button variant="contained">Return to Operations List</Button>
          </Link>
        </section>
      ) : (
        <MultiStepFormBase
          baseUrl={`/dashboard/operations/${operationId}`}
          cancelUrl="/dashboard/operations"
          // Add custom titles since "Statutory Declaration" is different than the
          // title in the schema "Statutory Declaration and Disclaimer"
          customHeaderTitles={[
            "Operation General Information",
            "Application Lead",
            "Statutory Declaration",
          ]}
          formData={formData}
          setErrorReset={setError}
          disabled={
            session?.user.app_role?.includes("cas") ||
            formData?.status === Status.PENDING
          }
          error={error}
          schema={schema}
          allowBackNavigation
          onSubmit={async (data: { formData?: any }) => {
            const method = isCreate ? "POST" : "PUT";
            const endpoint = isCreate
              ? "registration/operations"
              : `registration/operations/${formData?.id}?submit=${isFinalStep}`;
            const pathToRevalidate = isCreate
              ? "dashboard/operations"
              : `dashboard/operations/${formData?.id}`;

            // 🚀 API call: Get operator id associated with this user
            const responseOpId = await actionHandler(
              "registration/user-operator-operator-id",
              "GET",
              "",
            );
            if (responseOpId.error) {
              setError(responseOpId.error);
              return;
            }
            const body = {
              ...formData,
              ...data.formData,
              //  temporary handling of documents, will be addressed in #332/325
              documents: [],
              operator_id: responseOpId.operator_id,
              application_lead_id: formData?.application_lead?.id,
            };

            const response = await actionHandler(
              endpoint,
              method,
              pathToRevalidate,
              {
                body: JSON.stringify(body),
              },
            );

            const operation = response?.id || operationId;

            if (response.error) {
              setError(response.error);
              // return error so MultiStepFormBase can re-enable the submit button
              // and user can attempt to submit again
              return { error: response.error };
            }

            router.replace(`/dashboard/operations/${operation}/${formSection}`);
            if (isNotFinalStep) {
              router.push(
                `/dashboard/operations/${operation}/${formSection + 1}`,
              );
              return;
            }
            setOperationName(response.name);
          }}
          uiSchema={operationUiSchema}
        />
      )}
    </>
  );
}

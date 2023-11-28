"use client";

import { useState } from "react";
import { operationUiSchema } from "@/app/utils/jsonSchema/operations";
import MultiStepFormBase from "@/app/components/form/MultiStepFormBase";
import { Button } from "@mui/material";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { actionHandler } from "@/app/utils/actions";
import { useSession } from "next-auth/react";

export interface OperationsFormData {
  [key: string]: any;
}

interface Props {
  schema: any;
  formData?: OperationsFormData;
}

export default function OperationsForm({ formData, schema }: Props) {
  const { data: session } = useSession();
  const userEmail = session?.user?.email;

  const [operationName, setOperationName] = useState("");
  const [error, setError] = useState(undefined);
  const router = useRouter();
  const params = useParams();
  const formSection = parseInt(params?.formSection as string);
  const operationId = params?.operation;
  const isCreate = params?.operation === "0";

  const isApplicationLeadExternal =
    userEmail === formData?.application_lead?.email ? false : true;

  const applicationLeadDetails = {
    al_first_name: formData?.application_lead?.first_name,
    al_last_name: formData?.application_lead?.last_name,
    al_position_title: formData?.application_lead?.position_title,
    al_street_address: formData?.application_lead?.street_address,
    al_municipality: formData?.application_lead?.municipality,
    al_province: formData?.application_lead?.province,
    al_postal_code: formData?.application_lead?.postal_code,
    al_email: formData?.application_lead?.email,
    al_phone_number: formData?.application_lead?.phone_number,
  };

  // need to convert some of the information received from django into types RJSF can read
  const transformedFormData = {
    ...formData,
    previous_year_attributable_emissions:
      formData?.previous_year_attributable_emissions &&
      Number(formData?.previous_year_attributable_emissions),
    swrs_facility_id:
      formData?.swrs_facility_id && Number(formData?.swrs_facility_id),
    bcghg_id: formData?.bcghg_id && Number(formData?.bcghg_id),
    operator_percent_of_ownership:
      formData?.operator_percent_of_ownership &&
      Number(formData?.operator_percent_of_ownership),
    "Did you submit a GHG emissions report for reporting year 2022?":
      formData?.previous_year_attributable_emissions ? true : false,

    is_application_lead_external: isApplicationLeadExternal,
    ...(isApplicationLeadExternal && applicationLeadDetails),
    verified_at: formData?.verified_at?.toString(),
    verified_by: formData?.verified_by?.toString(),
  };

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
          formData={transformedFormData}
          readonly={
            formData?.status === "Registered" || formData?.status === "Pending"
              ? true
              : false
          }
          error={error}
          schema={schema}
          submitEveryStep
          showSubmissionStep
          onSubmit={async (data: { formData?: any }) => {
            const method = isCreate ? "POST" : "PUT";
            const endpoint = isCreate
              ? "registration/operations"
              : `registration/operations/${formData?.id}?submit=${isFinalStep}`;
            const pathToRevalidate = isCreate
              ? "dashboard/operations"
              : `dashboard/operations/${formData?.id}`;
            const body = {
              ...formData,
              ...data.formData,
              //  temporary handling of documents, will be addressed in #332/325
              documents: [],
              // temporarily mocking bceid login
              operator_id: 1,
              application_lead: formData?.application_lead?.id,
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
              return;
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

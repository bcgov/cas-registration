"use client";

import { useState } from "react";
import {
  operationUiSchema,
  /*   operationsGroupSchema, */
} from "@/app/utils/jsonSchema/operations";
import MultiStepFormBase from "@/app/components/form/MultiStepFormBase";
import Link from "next/link";
import { operationSubmitHandler } from "@/app/utils/actions";
import { useParams, useRouter } from "next/navigation";

export interface OperationsFormData {
  [key: string]: any;
}

interface Props {
  schema: any;
  formData?: OperationsFormData;
}

export default function OperationsForm({ formData, schema }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [operationName, setOperationName] = useState("");
  const [error, setError] = useState(undefined);
  const router = useRouter();
  const params = useParams();
  const formSection = parseInt(params?.formSection as string) - 1;
  const operationId = params?.operation;
  const isCreate = params?.operation === "create";

  // need to convert some of the information received from django into types RJSF can read
  const existingFormData = {
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
    verified_at: formData?.verified_at?.toString(),
    verified_by: formData?.verified_by?.toString(),
    //  temporary handling of required many-to-many fields, will be addressed in #138
    regulated_products: "",
    reporting_activities: "",
  };
  const formSectionList = Object.keys(schema.properties as any);
  const isNotFinalStep = formSection !== formSectionList.length - 1;
  const isFinalStep = formSection === formSectionList.length - 1;
  // Todo: reimplement success message

  return (
    <>
      {operationName ? (
        <section className="w-full flex-col flex align-center">
          <p>
            Your request to register <b>{operationName}</b> has been received.
          </p>
          <p>We will review your request as soon as possible!</p>
          <p>Once approved, you will receive a confirmation email.</p>
          <p>
            You can then log back and download the declartion form for carbon
            tax exemption for the operation.
          </p>
          <p>
            <Link href="#">Have not received the confirmation email yet?</Link>
          </p>
        </section>
      ) : (
        <MultiStepFormBase
          baseUrl={`/dashboard/operations/${operationId}`}
          cancelUrl="/dashboard/operations"
          formData={existingFormData}
          formSectionList={formSectionList}
          readonly={
            formData?.status === "Registered" || formData?.status === "Pending"
              ? true
              : false
          }
          error={error}
          schema={schema}
          submitEveryStep
          onSubmit={async (data: { formData?: any }) => {
            const response = await operationSubmitHandler(
              {
                ...formData,
                ...data.formData,
                //  temporary handling of required many-to-many fields, will be addressed in #138
                documents: [],
                contacts: [],
                regulated_products: [],
                reporting_activities: [],
                operator_id: 1,
              },
              isCreate ? "POST" : "PUT",
              isFinalStep
            );

            const operation = response?.id || operationId;

            if (response.error) {
              setError(response.error);
              return;
            }

            router.replace(
              `/dashboard/operations/${operation}/${formSection + 1}`
            );
            if (isNotFinalStep) {
              router.push(
                `/dashboard/operations/${operation}/${formSection + 2}`
              );
              return;
            }
            setOperationName(response.name);
          }}
          uiSchema={operationUiSchema}
          // formContext={{
          //   groupSchema: operationsGroupSchema,
          // }}
        />
      )}
    </>
  );
}

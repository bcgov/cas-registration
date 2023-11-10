"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  operationUiSchema,
  /*   operationsGroupSchema, */
} from "@/app/utils/jsonSchema/operations";
import FormBase from "@/app/components/form/FormBase";
import { RJSFSchema } from "@rjsf/utils";
import Link from "next/link";
import MultiStepButtons from "@/app/components/form/MultiStepButtons";
import { Alert } from "@mui/material";
import { operationSubmitHandler } from "@/app/utils/actions";

export interface OperationsFormData {
  [key: string]: any;
}
interface Props {
  schema: RJSFSchema;
  formData?: OperationsFormData;
}

export default function OperationsForm({ formData, schema }: Props) {
  const [operationName, setOperationName] = useState("");
  const [error, setError] = useState(undefined);

  const params = useParams();
  const formSection = parseInt(params?.formSection as string) - 1;

  // need to convert some of the information received from django into types RJSF can read
  const existingFormData = {
    ...formData,

    previous_year_attributable_emissions: Number(
      formData?.previous_year_attributable_emissions
    ),
    swrs_facility_id: Number(formData?.swrs_facility_id),
    bcghg_id: Number(formData?.bcghg_id),
    operator_percent_of_ownership: Number(
      formData?.operator_percent_of_ownership
    ),
    "Did you submit a GHG emissions report for reporting year 2022?":
      formData?.previous_year_attributable_emissions ? true : false,
    verified_at: formData?.verified_at?.toString(),
    verified_by: formData?.verified_by?.toString(),
    //  temporary handling of required many-to-many fields, will be addressed in #138
    regulated_products: "",
    reporting_activities: "",
  };
  // handle form state externally so we can save data for multiple pages of the form
  const [formState, setFormState] = useState(existingFormData || {});
  const formSectionList = Object.keys(schema.properties as any);

  return operationName ? (
    <>
      <p>Your request to register {operationName} has been received.</p>
      <p>We will review your request as soon as possible!</p>
      <p>Once approved, you will receive a confirmation email.</p>
      <p>
        You can then log back and download the declartion form for carbon tax
        exemption for the operation.
      </p>
      <p>
        <Link href="#">Have not received the confirmation email yet?</Link>
      </p>
    </>
  ) : (
    <FormBase
      // Because this is an RJSF form, we can't use the Nextjs13.5 pattern of putting a function in the action prop and using the useFormState hook.
      readonly={
        formData?.status === "Registered" || formData?.status === "Pending"
          ? true
          : false
      }
      schema={schema.properties[formSectionList[formSection]] as RJSFSchema}
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
          formData ? "PUT" : "POST"
        );
        if (response.error) {
          setError(response.error);
          return;
        }
        setOperationName(response.name);
      }}
      uiSchema={operationUiSchema}
      // formContext={{
      //   groupSchema: operationsGroupSchema,
      // }}
      formData={formState}
      onChange={(e) => {
        // merge page data with existing form data
        setFormState({
          ...formState,
          ...e.formData,
        });
      }}
    >
      {error && <Alert severity="error">{error}</Alert>}
      <MultiStepButtons
        baseUrl="/dashboard/operations/create"
        formSection={formSection}
        formSectionList={formSectionList}
        cancelUrl="/dashboard/operations"
      />
    </FormBase>
  );
}

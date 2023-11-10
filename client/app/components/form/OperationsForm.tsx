"use client";

import {
  operationUiSchema,
  operationsGroupSchema,
} from "@/app/utils/jsonSchema/operations";
import FormBase from "@/app/components/form/FormBase";
import { RJSFSchema } from "@rjsf/utils";
import Link from "next/link";
import React from "react";
import { Alert } from "@mui/material";
import SubmitButton from "./SubmitButton";
import { operationSubmitHandler } from "@/app/utils/actions";

export interface OperationsFormData {
  [key: string]: any;
}
interface Props {
  schema: RJSFSchema;
  formData?: OperationsFormData;
}

export default function OperationsForm(props: Props) {
  const [operationName, setOperationName] = React.useState("");
  const [error, setError] = React.useState(undefined);
  // need to convert some of the information received from django into types RJSF can read
  const existingFormData = {
    ...props.formData,

    previous_year_attributable_emissions: Number(
      props.formData?.previous_year_attributable_emissions,
    ),
    swrs_facility_id: Number(props.formData?.swrs_facility_id),
    bcghg_id: Number(props.formData?.bcghg_id),
    operator_percent_of_ownership: Number(
      props.formData?.operator_percent_of_ownership,
    ),
    "Did you submit a GHG emissions report for reporting year 2022?": props
      .formData?.previous_year_attributable_emissions
      ? true
      : false,
    verified_at: props.formData?.verified_at?.toString(),
    verified_by: props.formData?.verified_by?.toString(),
    //  temporary handling of required many-to-many fields, will be addressed in #138
    regulated_products: "",
    reporting_activities: "",
  };

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
        props.formData?.status === "Registered" ||
        props.formData?.status === "Pending"
          ? true
          : false
      }
      schema={props.schema}
      onSubmit={async (data: { formData?: any }) => {
        const response = await operationSubmitHandler(
          {
            ...props.formData,
            ...data.formData,
            //  temporary handling of required many-to-many fields, will be addressed in #138
            documents: [],
            contacts: [],
            regulated_products: [],
            reporting_activities: [],
            operator_id: 1,
          },
          props.formData ? "PUT" : "POST",
        );
        if (response.error) {
          setError(response.error);
          return;
        }
        setOperationName(response.name);
      }}
      uiSchema={operationUiSchema}
      formData={existingFormData}
      formContext={{
        groupSchema: operationsGroupSchema,
      }}
    >
      {error && <Alert severity="error">{error}</Alert>}
      <SubmitButton label="submit" />
    </FormBase>
  );
}

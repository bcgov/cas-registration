"use client";

import {
  operationUiSchema,
  operationsGroupSchema,
} from "@/utils/jsonSchema/operations";
// import { Form } from "@rjsf/mui";
import Form from "@rjsf/core";
import { RJSFSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import Link from "next/link";
import { useState } from "react";
import { Alert } from "@mui/material";
import SubmitButton from "./SubmitButton";
import { operationSubmitHandler } from "@/utils/actions";

export interface OperationsFormData {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  estimated_emissions: number;
  operator_percent_of_ownership: number;
  bcer_permit_id: number;
  npri_id: number;
  previous_year_attributable_emissions: number;
  current_year_estimated_emissions: number;
  swrs_facility_id: number;
  bcghg_id: number;
  start_of_commercial_operation: string;
  verified_at: string;
}

interface Props {
  schema: RJSFSchema;
  formData?: OperationsFormData;
}

export default function OperationsForm(props: Props) {
  const [operationName, setOperationName] = useState("");
  const [error, setError] = useState(undefined);
  const existingFormData = {
    ...props.formData,
    latitude: Number(props.formData?.latitude),
    longitude: Number(props.formData?.longitude),
    npri_id: Number(props.formData?.npri_id),
    bcer_permit_id: Number(props.formData?.bcer_permit_id),
    current_year_estimated_emissions: Number(
      props.formData?.current_year_estimated_emissions,
    ),
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
    start_of_commercial_operation:
      props.formData?.start_of_commercial_operation?.toString(),
    verified_at: props.formData?.verified_at?.toString(),
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
    // Operation General Information
    <>
      <Form
        // Because this is an RJSF form, we can't use the Nextjs13.5 pattern of putting a function in the action prop and using the useFormState hook.
        schema={props.schema}
        validator={validator}
        onSubmit={async (data: { formData?: any }) => {
          console.log("formdata", data.formData);
          const response = await operationSubmitHandler(
            {
              ...data.formData,
              //  temporary handling of required many-to-many fields, will be addressed in #138
              documents: [],
              contacts: [],
              petrinex_ids: [],
              regulated_products: [],
            },
            props.formData ? "PUT" : "POST",
          );
          if (response.error) {
            setError(response.error);
            return;
          }
          setOperationName(response.name);
        }}
        onChange={(formData) =>
          console.log("onchangeformdata", formData.formData)
        }
        uiSchema={operationUiSchema}
        formData={existingFormData}
        formContext={{
          groupSchema: operationsGroupSchema,
        }}
      >
        {error && <Alert severity="error">{error}</Alert>}
        <SubmitButton />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
      </Form>
    </>
  );
}

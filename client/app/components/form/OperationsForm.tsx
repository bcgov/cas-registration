"use client";

import { operationUiSchema } from "@/app/utils/jsonSchema/operations";
import { Form } from "@rjsf/mui";
import { RJSFSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import Link from "next/link";
import { useState } from "react";
import { Alert } from "@mui/material";
import SubmitButton from "./SubmitButton";
import { operationSubmitHandler } from "@/app/utils/actions/submitHandlers";

export interface OperationsFormData {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  estimated_emissions: number;
  operator_percent_of_ownership: number;
}

interface Props {
  schema: RJSFSchema;
  formData?: OperationsFormData;
}

export default function OperationsForm(props: Props) {
  const [operationName, setOperationName] = useState("");
  const [error, setError] = useState(undefined);

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
    <>
      <Form
        schema={props.schema}
        validator={validator}
        onSubmit={async (data: { formData?: any }) => {
          const response = await operationSubmitHandler(
            data.formData,
            props.formData ? "PUT" : "POST",
          );
          if (response.error) {
            setError(response.error);
            return;
          }
          setOperationName(response.name);
        }}
        uiSchema={operationUiSchema}
        formData={
          {
            ...props.formData,
            latitude: Number(props.formData?.latitude),
            longitude: Number(props.formData?.longitude),
            estimated_emissions: Number(props.formData?.estimated_emissions),
            operator_percent_of_ownership: Number(
              props.formData?.operator_percent_of_ownership,
            ),
          } ?? (props.formData as OperationsFormData)
        }
      >
        {error && <Alert severity="error">{error}</Alert>}
        <SubmitButton />
      </Form>
    </>
  );
}

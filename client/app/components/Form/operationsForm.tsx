"use client";

import { operationUiSchema } from "@/jsonSchema/operations";
import Link from "next/link";
import { useState } from "react";
import validator from "@rjsf/validator-ajv8";
import { Form } from "@rjsf/mui";
import { RJSFSchema } from "@rjsf/utils";
import { forceRefresh } from "@/app/utils/forceRefresh";
import { Button } from "@mui/material";

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
  const operationSubmitHandler = async (
    formData: OperationsFormData,
    method: "POST" | "PUT",
  ) => {
    try {
      const response = await fetch(
        method === "POST"
          ? "http://localhost:8000/api/registration/operations"
          : `http://localhost:8000/api/registration/operations/${formData.id}`,
        {
          method,
          body: JSON.stringify(formData),
        },
      );
      if (response.ok) {
        setOperationName(formData.name);
        forceRefresh("/operations");
      }
    } catch (err) {
      console.error("Failed to save the operation: ", err);
    }
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
    <>
      <Form
        schema={props.schema}
        validator={validator}
        onSubmit={(data: { formData: OperationsFormData }) =>
          // if we have props.formData, it means the operation already exists and we need to update rather than create it
          operationSubmitHandler(data.formData, props.formData ? "PUT" : "POST")
        }
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
          } ??
          // (props.formData as OperationsFormData)
          {}
        }
      >
        <div>
          <Button variant="contained" type="submit">
            Submit
          </Button>
        </div>
      </Form>
    </>
  );
}

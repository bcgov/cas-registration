"use client";

import { operationUiSchema } from "@/jsonSchema/operations";
import Link from "next/link";
import { useState } from "react";
import validator from "@rjsf/validator-ajv8";
import { Form } from "@rjsf/mui";
import { RJSFSchema } from "@rjsf/utils";
import { forceRefresh } from "@/app/utils/forceRefresh";

interface Props {
  schema: RJSFSchema;
  formData?: FormData;
}

export default function OperationsForm(props: Props) {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  console.log("formData", props.formData);
  // create stuff
  const operationSubmitHandler = async (data) => {
    try {
      const tranformedFormData = {
        ...data.formData,
        registered_for_obps: false,
      };
      const response = await fetch(
        "http://localhost:8000/api/registration/operations",
        {
          method: "POST",
          body: JSON.stringify(tranformedFormData),
        }
      ).then((res) => {
        return res; // JSON data parsed by `data.json()` call
      });
      if (response.ok) {
        setShowSuccessMessage(false);
        forceRefresh("/operations");
      }
    } catch (err) {
      console.error("Failed to save the operation: ", err);
    }
  };

  // edit stuff

  const operationUpdateHandler = async (data) => {
    const {
      naics_code,
      latitude,
      longitude,
      operator_percent_of_ownership,
      estimated_emissions,
      operator,
      id,
    } = data.formData;
    console.log("data.formData", data.formData);
    const transformedFormData = {
      ...data.formData,
      // foreign keys need _id appended to them
      // operator_id: operator,
      // naics_code_id: naics_code,
      // documents and contacts to be handled in card #138
      documents: [],
      contacts: [],
    };

    const response = await fetch(
      `http://localhost:8000/api/registration/operations/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(transformedFormData),
      }
    ).then((res) => {
      return res; // JSON data parsed by `data.json()` call
    });
    if (response.ok) {
      setShowSuccessMessage(false);
      forceRefresh("/operations");
    }
  };

  return showSuccessMessage ? (
    <>
      <div>You have successfully submitted the operation form</div>
      <Link href="/operations">Return to operations list</Link>
    </>
  ) : (
    <>
      <Form
        schema={props.schema}
        validator={validator}
        onSubmit={
          props.formData ? operationUpdateHandler : operationSubmitHandler
        }
        // disabled={isLoading}
        uiSchema={operationUiSchema}
        formData={props.formData ?? {}}
      ></Form>
      <Link href="/operations">Return to operations list</Link>
    </>
  );
}

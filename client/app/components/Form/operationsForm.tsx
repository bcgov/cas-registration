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

  const operationSubmitHandler = async (
    formData: { id: number },
    method: "POST" | "PUT"
  ) => {
    try {
      const response = await fetch(
        method === "POST"
          ? "http://localhost:8000/api/registration/operations"
          : `http://localhost:8000/api/registration/operations/${formData.id}`,
        {
          method,
          body: JSON.stringify(formData),
        }
      );
      if (response.ok) {
        setShowSuccessMessage(true);
        forceRefresh("/operations");
      }
    } catch (err) {
      console.error("Failed to save the operation: ", err);
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
        onSubmit={(data) =>
          // if we have props.formData, it means the operation already exists and we need to update rather than create it
          operationSubmitHandler(data.formData, props.formData ? "PUT" : "POST")
        }
        uiSchema={operationUiSchema}
        formData={props.formData ?? {}}
      ></Form>
    </>
  );
}

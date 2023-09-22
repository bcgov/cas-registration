"use client";

import { operationSchema, operationUiSchema } from "@/jsonSchema/operations";
import { useGetOperationQuery } from "@/redux";
import Form from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";

export default function Page({ params }: { params: { operation: number } }) {
  console.log("params.operation", params.operation);
  const { data, isLoading, error } = useGetOperationQuery(params.operation);

  if (!data) {
    return (
      <section>
        <h2>Operation not found!</h2>
      </section>
    );
  }

  return (
    <Form
      schema={operationSchema}
      validator={validator}
      onSubmit={operationUpdateHandler}
      disabled={isLoading}
      uiSchema={operationUiSchema}
    ></Form>
  );
}

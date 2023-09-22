"use client";

import { operationSchema, operationUiSchema } from "@/jsonSchema/operations";
import { useGetOperationQuery, useEditOperationMutation } from "@/redux";
import { Form } from "@rjsf/mui";

import validator from "@rjsf/validator-ajv8";

export default function Page({ params }: { params: { operation: number } }) {
  const {
    data: operation,
    isLoading: isLoadingOperation,
    error,
  } = useGetOperationQuery(params.operation);
  const [updateOperation, { isLoading: isLoadingUpdate }] =
    useEditOperationMutation();

  const operationUpdateHandler = async (data) => {
    await updateOperation(data.formData);
  };
  if (!operation) {
    return (
      <section>
        <h2>Operation not found!</h2>
      </section>
    );
  }
  console.log("operation", operation);

  return (
    <Form
      schema={operationSchema}
      validator={validator}
      onSubmit={operationUpdateHandler}
      disabled={isLoadingOperation}
      uiSchema={operationUiSchema}
      formData={operation}
    ></Form>
  );
}

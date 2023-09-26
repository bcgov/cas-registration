"use client";

import { operationSchema, operationUiSchema } from "@/jsonSchema/operations";
import {
  useGetOperationQuery,
  useEditOperationMutation,
  useGetNaicsCodesQuery,
} from "@/redux";
import { Form } from "@rjsf/mui";

import validator from "@rjsf/validator-ajv8";
import Link from "next/link";
import { useMemo, useState } from "react";

export const createOperationSchema = (schema, naics_codes) => {
  const localSchema = JSON.parse(JSON.stringify(operationSchema));
  localSchema.properties.naics_code.enum = naics_codes?.map((code) => code.id);
  return localSchema;
};

export default function Page({ params }: { params: { operation: number } }) {
  const {
    data: operation,
    isLoading: isLoadingOperation,
    error,
  } = useGetOperationQuery(params.operation);
  const [updateOperation, { isLoading: isLoadingUpdate }] =
    useEditOperationMutation();

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const { data: naics_codes, isLoading: isLoadingNaicsCodes } =
    useGetNaicsCodesQuery(null);

  const localSchema = createOperationSchema(operationSchema, naics_codes);

  const operationUpdateHandler = async (data) => {
    const { naics_code, operator } = data.formData;

    const transformedFormData = {
      ...data.formData,
      // foreign keys need _id appended to them
      operator_id: operator,
      naics_code_id: naics_code,
      // documents and contacts to be handled in card #138
      documents: [],
      contacts: [],
    };

    await updateOperation(transformedFormData).then(() =>
      setShowSuccessMessage(true)
    );
  };

  if (!operation) {
    return (
      <section>
        <h2>Operation not found!</h2>
      </section>
    );
  }

  return showSuccessMessage ? (
    <>
      <div>You have successfully submitted the operation form</div>
      <Link href="/operations">Return to operations list</Link>
    </>
  ) : (
    <Form
      schema={localSchema}
      validator={validator}
      onSubmit={operationUpdateHandler}
      disabled={isLoadingOperation}
      uiSchema={operationUiSchema}
      formData={{
        ...operation,
        // foreign keys are an object rather than a single value
        naics_code: operation.naics_code.id,
        operator: operation.operator.id,
      }}
    ></Form>
  );
}

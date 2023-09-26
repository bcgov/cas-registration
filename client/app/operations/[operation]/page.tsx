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
  localSchema.properties.naics_code.enum = naics_codes?.map(
    (code) => code.naics_code
  );
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

  console.log("localSchema", localSchema);

  const operationUpdateHandler = async (data) => {
    const {
      naics_code,
      latitude,
      longitude,
      operator_percent_of_ownership,
      estimated_emissions,
      operator,
    } = data.formData;

    const transformedFormData = {
      ...data.formData,
      operator_id: operator,
      naics_code_id: naics_code.toString(),
      naics_code: naics_code,
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      operator_percent_of_ownership: operator_percent_of_ownership.toString(),
      estimated_emissions: estimated_emissions.toString(),
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
        naics_code: Number(operation.naics_code),
        latitude: Number(operation.latitude),
        longitude: Number(operation.longitude),
        operator_percent_of_ownership: Number(
          operation.operator_percent_of_ownership
        ),
        estimated_emissions: Number(operation.estimated_emissions),
      }}
    ></Form>
  );
}

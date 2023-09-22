"use client";

import { operationSchema, operationUiSchema } from "@/jsonSchema/operations";
import {
  useGetOperationQuery,
  useEditOperationMutation,
  useGetNaicsCodesQuery,
} from "@/redux";
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

  const { data: naics_codes, isLoading: isLoadingNaicsCodes } =
    useGetNaicsCodesQuery(null);

  const localSchema = JSON.parse(JSON.stringify(operationSchema));
  if (!isLoadingOperation && !isLoadingNaicsCodes) {
    localSchema.properties.naics_code.anyOf = naics_codes?.map((code) => {
      return {
        type: "number",
        title: code.name,
        enum: [code.id],
        value: code.id,
      };
    });
  }

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

    await updateOperation(transformedFormData);
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

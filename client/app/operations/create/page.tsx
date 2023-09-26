"use client";
import {
  djangoApiSlice,
  useAddNewOperationMutation,
  useGetNaicsCodesQuery,
} from "@/redux";

import validator from "@rjsf/validator-ajv8";
import Form from "@rjsf/mui";
import { operationSchema, operationUiSchema } from "@/jsonSchema/operations";
import { useState } from "react";
import Link from "next/link";
import { createOperationSchema } from "../[operation]/page";
import { createSelector } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

export default function Page() {
  const [addNewOperation, { isLoading }] = useAddNewOperationMutation();

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const { data: naics_codes, isLoading: isLoadingNaicsCodes } =
    useGetNaicsCodesQuery(null);
  const localSchema = createOperationSchema(operationSchema, naics_codes);

  const operationSubmitHandler = async (data) => {
    const {
      naics_code,
      latitude,
      longitude,
      operator_percent_of_ownership,
      estimated_emissions,
      operator,
    } = data.formData;
    if (!isLoading) {
      try {
        const tranformedFormData = {
          ...data.formData,
          registered_for_obps: false,
          operator_id: operator,
          naics_code_id: naics_code.toString(),
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          operator_percent_of_ownership:
            operator_percent_of_ownership.toString(),
          estimated_emissions: estimated_emissions.toString(),
          documents: [],
          contacts: [],
        };
        await addNewOperation(tranformedFormData).then(() =>
          setShowSuccessMessage(true)
        );
      } catch (err) {
        console.error("Failed to save the operation: ", err);
      }
    }
  };

  return showSuccessMessage ? (
    <>
      <div>You have successfully submitted the operation form</div>
      <Link href="/operations">Return to operations list</Link>
    </>
  ) : (
    <Form
      schema={localSchema}
      validator={validator}
      onSubmit={operationSubmitHandler}
      disabled={isLoading}
      uiSchema={operationUiSchema}
    ></Form>
  );
}

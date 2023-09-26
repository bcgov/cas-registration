"use client";

import { operationUiSchema } from "@/jsonSchema/operations";
import { useAddNewOperationMutation, useEditOperationMutation } from "@/redux";
import Link from "next/link";
import { useState } from "react";
import validator from "@rjsf/validator-ajv8";
import { Form } from "@rjsf/mui";
import { RJSFSchema } from "@rjsf/utils";

interface Props {
  schema: RJSFSchema;
  formData?: FormData;
}

export default function OperationsForm(props: Props) {
  const [addNewOperation, { isLoading }] = useAddNewOperationMutation();

  // brianna this doesn't work yet
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // create stuff
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

  // edit stuff
  const [updateOperation, { isLoading: isLoadingUpdate }] =
    useEditOperationMutation();

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

  return showSuccessMessage ? (
    <>
      <div>You have successfully submitted the operation form</div>
      <Link href="/operations">Return to operations list</Link>
    </>
  ) : (
    <Form
      schema={props.schema}
      validator={validator}
      onSubmit={
        props.formData ? operationUpdateHandler : operationSubmitHandler
      }
      disabled={isLoading}
      uiSchema={operationUiSchema}
      formData={props.formData ?? {}}
    ></Form>
  );
}

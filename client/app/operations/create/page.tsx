"use client";
import { useAddNewOperationMutation } from "@/redux";

import validator from "@rjsf/validator-ajv8";
import Form from "@rjsf/mui";
import { operationSchema, operationUiSchema } from "@/jsonSchema/operations";

export default function Page() {
  const [addNewOperation, { isLoading }] = useAddNewOperationMutation();

  const operationSubmitHandler = async (data) => {
    if (!isLoading) {
      try {
        const updatedFormData = {
          ...data.formData,
        };
        await addNewOperation(updatedFormData).unwrap();
      } catch (err) {
        console.error("Failed to save the operation: ", err);
      }
    }
  };

  return (
    <Form
      schema={operationSchema}
      validator={validator}
      onSubmit={operationSubmitHandler}
      disabled={isLoading}
      uiSchema={operationUiSchema}
    ></Form>
  );
}

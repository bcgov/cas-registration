"use client";

import MultiStepBase from "@bciers/components/form/MultiStepBase";
import { OperationInformationFormData } from "apps/registration/app/components/operations/registration/types";
import { actionHandler } from "@bciers/actions";
import { useRouter } from "next/navigation";
import { RJSFSchema } from "@rjsf/utils";
import { useState } from "react";
import { IChangeEvent } from "@rjsf/core";
import { getOperationV2 } from "@bciers/actions/api";
import {
  createNestedFormData,
  createUnnestedFormData,
} from "@bciers/components/form/formDataUtils";
import { registrationOperationInformationUiSchema } from "@/registration/app/data/jsonSchema/operationInformation/registrationOperationInformation";

interface OperationInformationFormProps {
  rawFormData: OperationInformationFormData;
  schema: RJSFSchema;
  step: number;
  steps: string[];
}

const OperationInformationForm = ({
  rawFormData,
  schema,
  step,
  steps,
}: OperationInformationFormProps) => {
  const [selectedOperation, setSelectedOperation] = useState("");
  const [, setError] = useState(undefined);
  const nestedFormData = rawFormData
    ? createNestedFormData(rawFormData, schema)
    : {};
  const [formState, setFormState] = useState(nestedFormData);
  const [key, setKey] = useState(Math.random());
  const router = useRouter();

  function customValidate(
    formData: { [key: string]: any },
    errors: { [key: string]: any },
  ) {
    // @ts-ignore
    const requiredOperationProperties = schema?.properties?.section2.required;

    const isOperationInformationComplete = requiredOperationProperties.every(
      (el: any) => formData.section2[el],
    );

    if (!formData.section1.operation && !isOperationInformationComplete) {
      errors.section1.operation.addError("You must select or add an operation");
    }
    return errors;
  }

  const handleSubmit = async (data: { formData?: any }) => {
    const isCreating = !data.formData?.section1?.operation;
    const postEndpoint = `registration/v2/operations`;
    const putEndpoint = `registration/v2/operations/${data.formData?.section1?.operation}/registration/operation`;
    const body = JSON.stringify(
      createUnnestedFormData(data.formData, [
        "section1",
        "section2",
        "section3",
      ]),
    );
    const response = await actionHandler(
      isCreating ? postEndpoint : putEndpoint,
      isCreating ? "POST" : "PUT",
      "",
      {
        body,
      },
    ).then((response) => {
      console.log("operation information initial form response", response);
      if (response?.error) {
        // Don't necessarily need to return it like this, but it's a good practice
        // The final return should still return a reponse.error for MultiStepBase internal error handling
        // This is just for local handling
        console.log("operation information form error response", response);
        // Return response to MultiStepBase for error handling
        return { error: response.error };
      } else if (response?.id) {
        console.log("operation information form success response", response);
        const nextStepUrl = `/register-an-operation/${response.id}/${
          step + 1
        }${`?title=${response.name}`}`;
        router.push(nextStepUrl);
        // Return response to MultiStepBase
        return response;
      }
    });
    return response;
  };
  const handleSelectOperationChange = async (data: any) => {
    const operationId = data.section1.operation;
    try {
      setSelectedOperation(operationId);
      const operationData = await getOperationV2(operationId);
      // combine the entered data with the fetched data
      const combinedData = { ...data, section2: operationData };
      setFormState(combinedData);
      setKey(Math.random());
    } catch (err) {
      setError("Failed to fetch operation data!" as any);
    }
  };
  return (
    <MultiStepBase
      key={key}
      cancelUrl="/"
      formData={formState}
      onSubmit={handleSubmit}
      schema={schema}
      step={step}
      steps={steps}
      onChange={(e: IChangeEvent) => {
        let newSelectedOperation = e.formData?.section1?.operation;
        if (
          newSelectedOperation &&
          newSelectedOperation !== selectedOperation
        ) {
          handleSelectOperationChange(e.formData);
        }
      }}
      uiSchema={registrationOperationInformationUiSchema}
      customValidate={customValidate}
    />
  );
};

export default OperationInformationForm;

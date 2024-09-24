"use client";

import MultiStepBase from "@bciers/components/form/MultiStepBase";
import { OperationInformationFormData } from "apps/registration/app/components/operations/registration/types";
import { actionHandler } from "@bciers/actions";
import { RJSFSchema } from "@rjsf/utils";
import { useState } from "react";
import { IChangeEvent } from "@rjsf/core";
import { getOperationV2 } from "@bciers/actions/api";
import {
  createNestedFormData,
  createUnnestedFormData,
} from "@bciers/components/form/formDataUtils";
import { registrationOperationInformationUiSchema } from "@/registration/app/data/jsonSchema/operationInformation/registrationOperationInformation";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [selectedOperation, setSelectedOperation] = useState("");
  const [error, setError] = useState(undefined);
  const nestedFormData = rawFormData
    ? createNestedFormData(rawFormData, schema)
    : {};
  const [formState, setFormState] = useState(nestedFormData);
  const [key, setKey] = useState(Math.random());

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
    );
    // errors are handled in MultiStepBase
    return response;
  };
  const handleSelectOperationChange = async (data: any) => {
    const operationId = data.section1.operation;
    try {
      setSelectedOperation(operationId);
      const operationData = await getOperationV2(operationId);
      if (operationData?.error) {
        setError("Failed to fetch operation data!" as any);
      }
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
      firstStepExtraHandling={(response) => {
        // Since our form's route includes the operation's id, which doesn't exist until after the first step, we need to pass in a custom function that uses the response to generate a redirect url
        const nextStepUrl = `/register-an-operation/${response.id}/${
          step + 1
        }$`;
        router.push(nextStepUrl);
      }}
      schema={schema}
      step={step}
      steps={steps}
      error={error}
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

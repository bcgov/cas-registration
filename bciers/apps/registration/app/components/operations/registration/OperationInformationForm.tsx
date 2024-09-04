"use client";

import MultiStepBase from "@bciers/components/form/MultiStepBase";
import { registrationOperationInformationUiSchema } from "apps/registration/app/data/jsonSchema/operationRegistration/operationInformation";
import { OperationInformationFormData } from "apps/registration/app/components/operations/registration/types";
import { actionHandler } from "@bciers/actions";
import { useRouter } from "next/navigation";
import { RJSFSchema } from "@rjsf/utils";
import { useState } from "react";
import { IChangeEvent } from "@rjsf/core";
import { getOperation } from "@bciers/actions/api";
import { UUID } from "crypto";
import {
  createNestedFormData,
  createUnnestedFormData,
} from "@bciers/components/form/formDataUtils";
import {
  createAdministrationOperationInformationSchema,
  createMultipleOperatorsInformationSchema,
  createOperationInformationSchema,
  operationInformationSchema,
  operationUiSchema,
} from "@/administration/app/data/jsonSchema/operationInformation";
import { briannaCreateSchema } from "@/administration/app/components/operations/OperationInformationPage";

interface OperationInformationFormProps {
  formData: OperationInformationFormData;
  schema: RJSFSchema;
  step: number;
  steps: string[];
}

const OperationInformationForm = ({
  formData,
  schema,
  step,
  steps,
}: OperationInformationFormProps) => {
  const [selectedOperation, setSelectedOperation] = useState("");
  const [error, setError] = useState(undefined);
  const [formState, setFormState] = useState(formData ?? {});
  const [key, setKey] = useState(Math.random());
  const router = useRouter();
  console.log("schema", schema);
  const handleSubmit = async (data: { formData?: any }) => {
    const isCreating = !data.formData?.section1?.operation;
    console.log("iscreating", isCreating);
    const postEndpoint = `registration/v2/operations`;
    const putEndpoint = `registration/v2/operations/${data.formData?.section1?.operation}/registration/operation`;
    console.log("data.formdata", data.formData);
    const body = JSON.stringify(
      createUnnestedFormData(data.formData, ["section1", "section2"]),
    );
    console.log("body", body);
    const response = await actionHandler(
      isCreating ? postEndpoint : putEndpoint,
      isCreating ? "POST" : "PUT",
      "",
      {
        body,
      },
    );
    console.log("response", response);
    // handling the redirect here instead of in the MultiStepBase because we don't have the operation information until we receive the response
    const nextStepUrl = `/register-an-operation/${response.id}/${
      step + 1
    }${`?title=${response.name}`}`;
    // router.push(nextStepUrl);
  };
  const handleSelectOperationChange = async (data: any) => {
    const operationId = data.section1.operation;
    try {
      setSelectedOperation(operationId);
      const operationData = await getOperation(operationId);

      const nestedOperationData = createNestedFormData(operationData, {
        type: "object",
        properties: {
          section2: await createOperationInformationSchema(),
          section3: await createMultipleOperatorsInformationSchema(),
        },
      });
      console.log("nestedOperationData", nestedOperationData);
      // combine the entered data with the fetched data
      const combinedData = { ...data, ...nestedOperationData };
      console.log("data", data);
      console.log("combineddata", combinedData);
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
        // brianna still have to handle clear
        if (
          newSelectedOperation &&
          newSelectedOperation !== selectedOperation
        ) {
          handleSelectOperationChange(e.formData);
        }
      }}
      uiSchema={registrationOperationInformationUiSchema}
    />
  );
};

export default OperationInformationForm;

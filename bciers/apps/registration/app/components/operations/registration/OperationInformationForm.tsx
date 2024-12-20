"use client";

import MultiStepBase from "@bciers/components/form/MultiStepBase";
import { OperationInformationFormData } from "apps/registration/app/components/operations/registration/types";
import { actionHandler } from "@bciers/actions";
import { RJSFSchema } from "@rjsf/utils";
import { useState } from "react";
import { Button, Box } from "@mui/material";
import { IChangeEvent } from "@rjsf/core";
import { getOperationRegistration } from "@bciers/actions/api";
import {
  createNestedFormData,
  createUnnestedFormData,
} from "@bciers/components/form/formDataUtils";
import { registrationOperationInformationUiSchema } from "@/registration/app/data/jsonSchema/operationInformation/registrationOperationInformation";
import { useRouter } from "next/navigation";
import {
  RegistrationPurposeHelpText,
  RegistrationPurposes,
} from "@/registration/app/components/operations/registration/enums";
import Modal from "@bciers/components/modal/Modal";
import { isUndefined } from "lodash";

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
  const [pendingFormDataState, setPendingFormDataState] = useState<any>();
  const [key, setKey] = useState(Math.random());
  const [selectedPurpose, setSelectedPurpose] = useState("");
  const [currentUiSchema, setCurrentUiSchema] = useState(
    registrationOperationInformationUiSchema,
  );
  const [isModalOpenState, setIsModalOpenState] = useState(false);

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
    const postEndpoint = `registration/operations`;
    const putEndpoint = `registration/operations/${data.formData?.section1?.operation}/registration/operation`;
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
    ).then((resolve) => {
      if (resolve?.error) {
        return { error: resolve.error };
      } else if (resolve?.id) {
        // this form step needs a custom push (can't use the push in MultiStepBase) because the resolve.id is in the url
        const nextStepUrl = `/register-an-operation/${resolve.id}/${step + 1}`;
        router.push(nextStepUrl);
        return resolve;
      }
    });
    return response;
  };
  const handleSelectOperationChange = async (data: any) => {
    const operationId = data.section1.operation;
    setSelectedOperation(operationId);
    const operationData = await getOperationRegistration(operationId);
    if (operationData?.error) {
      setError("Failed to fetch operation data!" as any);
    }
    // combine the entered data with the fetched data
    const combinedData = { ...data, section2: operationData };
    setFormState(combinedData);
    setKey(Math.random());
  };

  const handleCloseModal = () => {
    setIsModalOpenState(false);
  };

  const handleConfirmChangePurpose = () => {
    const newSelectedPurpose: RegistrationPurposes =
      pendingFormDataState.section1.registration_purpose;
    setSelectedPurpose(newSelectedPurpose);
    setCurrentUiSchema({
      ...registrationOperationInformationUiSchema,
      section1: {
        ...registrationOperationInformationUiSchema.section1,
        registration_purpose: {
          ...registrationOperationInformationUiSchema.section1
            .registration_purpose,
          "ui:help": newSelectedPurpose ? (
            <small>
              <b>Note: </b>
              {RegistrationPurposeHelpText[newSelectedPurpose]}
            </small>
          ) : null,
        },
      },
    });
    setFormState(pendingFormDataState);
    setPendingFormDataState(undefined);
    setIsModalOpenState(false);
  };

  return (
    <>
      <Modal
        title="Confirmation"
        open={isModalOpenState}
        onClose={handleCloseModal}
      >
        <Box
          sx={{
            fontSize: "16px",
            minWidth: "100%",
            margin: "8px 0",
          }}
        >
          Are you sure you want to change your registration purpose? If you
          proceed, all of the form data you have entered will be lost.
        </Box>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "left",
            marginTop: "24px",
          }}
        >
          <Button
            onClick={handleCloseModal}
            color="primary"
            variant="outlined"
            aria-label="Cancel"
          >
            {"Cancel"}
          </Button>
          <Button
            onClick={handleConfirmChangePurpose}
            color="primary"
            variant="contained"
            aria-label="Change registration purpose"
          >
            {"Change registration purpose"}
          </Button>
        </Box>
      </Modal>
      <MultiStepBase
        key={key}
        cancelUrl="/"
        formData={formState}
        onSubmit={handleSubmit}
        schema={schema}
        step={step}
        steps={steps}
        error={error}
        onChange={(e: IChangeEvent) => {
          let newSelectedOperation = e.formData?.section1?.operation;
          let newSelectedPurpose = e.formData?.section1?.registration_purpose;
          if (
            newSelectedOperation &&
            newSelectedOperation !== selectedOperation
          )
            handleSelectOperationChange(e.formData);
          if (
            newSelectedPurpose &&
            selectedPurpose != "" &&
            newSelectedPurpose !== selectedPurpose
          )
            console.log(
              "selected purpose ",
              selectedPurpose,
              " newSelectedPurpose ",
              newSelectedPurpose,
            );
          setPendingFormDataState(e.formData);
          setIsModalOpenState(true);
          // handleSelectedPurposeChange(e.formData);
        }}
        uiSchema={currentUiSchema}
        customValidate={customValidate}
      />
    </>
  );
};

export default OperationInformationForm;

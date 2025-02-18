"use client";

import MultiStepBase from "@bciers/components/form/MultiStepBase";
import { OperationInformationFormData } from "apps/registration/app/components/operations/registration/types";
import { actionHandler } from "@bciers/actions";
import { RJSFSchema } from "@rjsf/utils";
import { useState, useEffect } from "react";
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
import { eioOperationInformationSchema } from "@/administration/app/data/jsonSchema/operationInformation/operationInformation";
import ConfirmChangeOfRegistrationPurposeModal from "./ConfirmChangeOfRegistrationPurposeModal";

interface OperationInformationFormProps {
  rawFormData: OperationInformationFormData;
  schema: RJSFSchema;
  step: number;
  steps: string[];
}

const OperationInformationForm = ({
  rawFormData,
  schema: initialSchema,
  step,
  steps,
}: OperationInformationFormProps) => {
  const router = useRouter();
  const [selectedOperation, setSelectedOperation] = useState(
    rawFormData.operation,
  );

  const [error, setError] = useState(undefined);
  const [schema, setSchema] = useState(initialSchema);
  const nestedFormData = rawFormData
    ? createNestedFormData(rawFormData, schema)
    : {};
  const [formState, setFormState] = useState(nestedFormData);
  const [isConfirmPurposeChangeModalOpen, setIsConfirmPurposeChangeModalOpen] =
    useState<boolean>(false);
  const [key, setKey] = useState(Math.random());
  const [selectedPurpose, setSelectedPurpose] = useState(
    formState.section1?.registration_purpose || "",
  );
  const [
    pendingChangeRegistrationPurpose,
    setPendingChangeRegistrationPurpose,
  ] = useState<RegistrationPurposes | "">("");
  const [currentUiSchema, setCurrentUiSchema] = useState(
    registrationOperationInformationUiSchema,
  );
  const updateUiSchemaWithHelpText = (
    registrationPurpose: RegistrationPurposes,
  ) => {
    setCurrentUiSchema({
      ...registrationOperationInformationUiSchema,
      section1: {
        ...registrationOperationInformationUiSchema.section1,
        registration_purpose: {
          ...registrationOperationInformationUiSchema.section1
            .registration_purpose,
          "ui:help": (
            <small>
              <b>Note: </b>
              {RegistrationPurposeHelpText[registrationPurpose]}
            </small>
          ),
        },
      },
    });
  };

  useEffect(() => {
    if (selectedPurpose) {
      if (
        selectedPurpose === RegistrationPurposes.ELECTRICITY_IMPORT_OPERATION
      ) {
        // EIOs only require basic information, so if a user selects EIO we remove some of the form fields
        setSchema({
          ...initialSchema,
          properties: {
            ...initialSchema.properties,
            section2: eioOperationInformationSchema,
          },
        });
      } else {
        setSchema(initialSchema);
      }
      setFormState((prevState) => ({
        ...prevState,
        section1: {
          ...prevState.section1,
          registration_purpose: selectedPurpose,
        },
      }));
      updateUiSchemaWithHelpText(selectedPurpose);
      setIsConfirmPurposeChangeModalOpen(false);
    }
  }, [selectedPurpose]);

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
        const nextStepUrl = `/register-an-operation/${resolve.id}/${
          step + 1
        }?operations_title=${encodeURIComponent(resolve.name)}`;
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

  const handleSelectedPurposeChange = (data: any) => {
    const newSelectedPurpose: RegistrationPurposes =
      data.section1?.registration_purpose;
    // if purpose is being selected for the first time, we don't need to show
    // the ConfirmChangeOfRegistrationPurposeModal. Just need to update
    // the state for selectedPurpose, and show the RegistrationPurposeHelpText
    if (newSelectedPurpose && selectedPurpose == "") {
      setSelectedPurpose(newSelectedPurpose);
    }
    // if there was already a purpose selected, we need to confirm the user
    // wants to change their registration purpose before actioning it.
    else if (newSelectedPurpose && selectedPurpose) {
      setPendingChangeRegistrationPurpose(newSelectedPurpose);
      setIsConfirmPurposeChangeModalOpen(true);
    }
  };

  const cancelRegistrationPurposeChange = () => {
    setPendingChangeRegistrationPurpose("");
    setFormState((prevState) => ({
      ...prevState,
      section1: {
        ...prevState.section1,
        registration_purpose: selectedPurpose,
      },
    }));
    setKey(Math.random());
    setIsConfirmPurposeChangeModalOpen(false);
  };

  const confirmRegistrationPurposeChange = () => {
    if (pendingChangeRegistrationPurpose !== "") {
      setSelectedPurpose(pendingChangeRegistrationPurpose);
    }
    setPendingChangeRegistrationPurpose("");
    setIsConfirmPurposeChangeModalOpen(false);
  };

  return (
    <>
      <ConfirmChangeOfRegistrationPurposeModal
        open={isConfirmPurposeChangeModalOpen}
        cancelRegistrationPurposeChange={cancelRegistrationPurposeChange}
        confirmRegistrationPurposeChange={confirmRegistrationPurposeChange}
      />
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
          ) {
            handleSelectOperationChange(e.formData);
          }
          if (newSelectedPurpose !== selectedPurpose) {
            handleSelectedPurposeChange(e.formData);
          }
        }}
        uiSchema={currentUiSchema}
        customValidate={customValidate}
      />
    </>
  );
};

export default OperationInformationForm;

"use client";

import MultiStepBase from "@bciers/components/form/MultiStepBase";
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
import ConfirmChangeOfRegistrationPurposeModal from "@/registration/app/components/operations/registration/ConfirmChangeOfRegistrationPurposeModal";

interface OperationInformationFormProps {
  rawFormData: { [key: string]: any };
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
    rawFormData?.operation,
  );

  const [error, setError] = useState(undefined);
  const [schema, setSchema] = useState(initialSchema);
  const nestedFormData = rawFormData
    ? createNestedFormData(rawFormData, schema)
    : {};
  // pendingFormState holds the form's state when a user is trying to change the registration purpose but hasn't confirmed the change yet
  const [pendingFormState, setPendingFormState] = useState(
    {} as { [key: string]: any },
  );
  const [confirmedFormState, setConfirmedFormState] = useState(nestedFormData);
  const [isConfirmPurposeChangeModalOpen, setIsConfirmPurposeChangeModalOpen] =
    useState<boolean>(false);
  const [key, setKey] = useState(Math.random());
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
    if (confirmedFormState?.section1?.registration_purpose) {
      if (
        confirmedFormState.section1.registration_purpose ===
        RegistrationPurposes.ELECTRICITY_IMPORT_OPERATION
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
      setConfirmedFormState((prevState) => ({
        ...prevState,
        section1: {
          ...prevState.section1,
          registration_purpose:
            confirmedFormState.section1.registration_purpose,
        },
      }));
      updateUiSchemaWithHelpText(
        confirmedFormState.section1.registration_purpose,
      );
      setIsConfirmPurposeChangeModalOpen(false);
    }
  }, [confirmedFormState?.section1?.registration_purpose]);

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
    setConfirmedFormState(createNestedFormData(operationData, schema));
    setKey(Math.random()); // NOSONAR
  };

  const handleSelectedPurposeChange = (data: any) => {
    const newSelectedPurpose: RegistrationPurposes =
      data.section1?.registration_purpose;
    // if purpose is being selected for the first time, we don't need to show
    // the ConfirmChangeOfRegistrationPurposeModal. Just need to update
    // the state and show the RegistrationPurposeHelpText
    if (
      newSelectedPurpose &&
      !confirmedFormState?.section1?.registration_purpose
    ) {
      setConfirmedFormState({
        ...confirmedFormState,
        section1: {
          ...confirmedFormState.section1,
          registration_purpose: newSelectedPurpose,
        },
      });
    }
    // if there was already a purpose selected, we need to confirm the user
    // wants to change their registration purpose before actioning it.
    else if (
      newSelectedPurpose &&
      confirmedFormState?.section1?.registration_purpose
    ) {
      setPendingFormState({
        ...confirmedFormState,
        section1: {
          ...confirmedFormState.section1,
          registration_purpose: newSelectedPurpose,
        },
      });
      setIsConfirmPurposeChangeModalOpen(true);
    }
  };

  const cancelRegistrationPurposeChange = () => {
    setPendingFormState({});
    setKey(Math.random());
    setIsConfirmPurposeChangeModalOpen(false);
  };

  const confirmRegistrationPurposeChange = () => {
    if (pendingFormState?.section1?.registration_purpose) {
      setConfirmedFormState((prevState) => ({
        ...prevState,
        section1: {
          ...prevState.section1,
          registration_purpose: pendingFormState.section1.registration_purpose,
        },
      }));
    }
    setPendingFormState({});
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
        formData={confirmedFormState}
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
            return;
          }
          if (
            newSelectedPurpose !==
            confirmedFormState?.section1?.registration_purpose
          ) {
            handleSelectedPurposeChange(e.formData);
            return;
          }
          setConfirmedFormState(e.formData);
        }}
        uiSchema={currentUiSchema}
        customValidate={customValidate}
      />
    </>
  );
};

export default OperationInformationForm;

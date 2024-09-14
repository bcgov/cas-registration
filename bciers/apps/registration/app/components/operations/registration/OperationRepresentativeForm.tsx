"use client";

import MultiStepBase from "@bciers/components/form/MultiStepBase";
import {
  createOperationRepresentativeSchema,
  operationRepresentativeUiSchema,
} from "apps/registration/app/data/jsonSchema/operationRegistration/operationRepresentative";
import {
  OperationRepresentativeFormData,
  OperationsContacts,
} from "apps/registration/app/components/operations/registration/types";
import { actionHandler } from "@bciers/actions";
import { IChangeEvent } from "@rjsf/core";
import { contactsSchema } from "@/administration/app/data/jsonSchema/contact";
import { RJSFSchema } from "@rjsf/utils";
import { createUnnestedFormData } from "@bciers/components/form/formDataUtils";
import { useCallback, useState } from "react";
import { Button, Alert } from "@mui/material";
import { getContact } from "@bciers/actions/api";
import {
  ContactFormData,
  ContactRow,
} from "@/administration/app/components/contacts/types";
import { UUID } from "crypto";
import FormBase from "@bciers/components/form/FormBase";

interface OperationRepresentativeFormProps {
  operation: UUID;
  step: number;
  steps: string[];
  formData: OperationRepresentativeFormData;
  existingOperationRepresentatives: OperationsContacts[];
  contacts: ContactRow[];
}

// TODO: fix the type here
const OpRepBeforeForm: React.FC<any> = (props) => {
  const {
    disabled,
    formData,
    omitExtraData,
    formRef,
    onChange,
    onSubmit,
    readonly,
    setErrorReset,
    schema,
    uiSchema,
    existingOperationRepresentatives,
    contacts,
  } = props;

  const [error, setError] = useState(undefined);
  const [formState, setFormState] = useState(formData);
  const [currentContactId, setCurrentContactId] = useState("");
  const [key, setKey] = useState(Math.random());
  const [showSubmitButton, setShowSubmitButton] = useState(false);

  // useEffect(() => {
  //   setShowSubmitButton(false);
  // }, []);

  const modifiedSchema = createOperationRepresentativeSchema(
    existingOperationRepresentatives,
    contacts,
  );

  const handleSelectingContact = useCallback(
    async (newSelectedContactId: string) => {
      // TODO: disable first name, last name and email for updating existing contact
      try {
        const contactData: ContactFormData =
          await getContact(newSelectedContactId);

        // const nestedOpRepFormData = createNestedFormData(
        //   contactData,
        //   newOperationRepresentativeSchema,
        // );

        // setFormState((prevState) => ({
        //   ...prevState,
        //   // existing_contact_id: newSelectedContactId,
        //   ...nestedOpRepFormData,
        // }));
      } catch (err) {
        setError("Failed to fetch contact data!" as any);
      }
    },
    [],
  );

  // const handleClearingExistingContact = useCallback(() => {
  //   setFormState((prevState) => ({
  //     operation_representatives: prevState.operation_representatives,
  //   }));
  //   setKey(Math.random());
  // }, []);

  const handleChange = (e: IChangeEvent) => {
    const { formData: newFormData } = e;
    // setShowSubmitButton(true);
    const newSelectedContactId =
      newFormData.new_operation_representative[0]?.existing_contact_id || "";

    if (newSelectedContactId && newSelectedContactId !== currentContactId) {
      // setCurrentContactId(newSelectedContactId);
      handleSelectingContact(newSelectedContactId);
    }
    // else if (!newSelectedContactId) {
    //   setSelectedContactId("");
    //   handleClearingExistingContact();
    // }
  };
  const submitHandler = async (data: any) => {
    // TODO: implement this
    console.log("submitHandler data", data);
  };

  return (
    <FormBase
      key={key}
      schema={modifiedSchema}
      className="flex flex-col flex-grow"
      uiSchema={operationRepresentativeUiSchema}
      // disabled={isDisabled}
      // readonly={isDisabled}
      onChange={handleChange}
      onSubmit={submitHandler}
      formData={formState}
      setErrorReset={setErrorReset}
    >
      <div>
        <div className="min-h-[48px] box-border">
          {error && <Alert severity="error">{error}</Alert>}
        </div>
        {showSubmitButton && (
          <Button className="mt-4" variant="outlined" type="submit">
            Save Operation Representative
          </Button>
        )}
      </div>
    </FormBase>
  );
};

const OperationRepresentativeForm = ({
  formData,
  operation,
  step,
  steps,
  existingOperationRepresentatives,
  contacts,
}: OperationRepresentativeFormProps) => {
  const hasExistingOperationReps = existingOperationRepresentatives?.length > 0;

  return (
    <MultiStepBase
      allowBackNavigation
      baseUrl={`/register-an-operation/${operation}`}
      baseUrlParams={`title=${operation}`}
      cancelUrl="/"
      onSubmit={() => {}} //We just want to redirect to the next step
      schema={{}}
      step={step}
      steps={steps}
      uiSchema={{}}
      submitButtonText="Continue"
      submitButtonDisabled={!hasExistingOperationReps}
      beforeForm={
        <OpRepBeforeForm
          formData={formData}
          existingOperationRepresentatives={existingOperationRepresentatives}
          contacts={contacts}
        />
      }
    />
  );
};

export default OperationRepresentativeForm;

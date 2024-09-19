"use client";

import {
  createOperationRepresentativeSchema,
  createOperationRepresentativeUiSchema,
  newOperationRepresentativeSchema,
} from "apps/registration/app/data/jsonSchema/operationRegistration/operationRepresentative";
import {
  OperationRepresentativeFormData,
  OperationsContacts,
} from "apps/registration/app/components/operations/registration/types";
import { IChangeEvent } from "@rjsf/core";
import { createNestedFormData } from "@bciers/components/form/formDataUtils";
import { useState } from "react";
import { Button, Alert } from "@mui/material";
import { getContact } from "@bciers/actions/api";
import {
  ContactFormData,
  ContactRow,
} from "@/administration/app/components/contacts/types";
import FormBase, { FormPropsWithTheme } from "@bciers/components/form/FormBase";

interface FormState {
  operation_representatives?: number[];
  new_operation_representative: {
    existing_contact_id: string;
    [key: string]: any;
  }[];
}

interface NewOperationRepresentativeFormProps
  extends Omit<FormPropsWithTheme<any>, "schema" | "uiSchema"> {
  existingOperationRepresentatives: OperationsContacts[];
  contacts: ContactRow[];
}

const NewOperationRepresentativeForm: React.FC<
  NewOperationRepresentativeFormProps
> = (props) => {
  const {
    formData,
    setErrorReset,
    existingOperationRepresentatives,
    contacts,
  } = props;

  const [error, setError] = useState(undefined);
  const [formState, setFormState] = useState(formData);
  const [key, setKey] = useState(Math.random());
  const [existingContactId, setExistingContactId] = useState("");
  const [showSubmitButton, setShowSubmitButton] = useState(
    existingOperationRepresentatives?.length === 0,
  );

  const handleSelectingContact = async (newSelectedContactId: string) => {
    setExistingContactId(newSelectedContactId);
    try {
      const contactData: ContactFormData =
        await getContact(newSelectedContactId);

      const nestedOpRepFormData = createNestedFormData(
        contactData,
        newOperationRepresentativeSchema,
      );
      setFormState((prevState: FormState) => ({
        ...prevState,
        new_operation_representative: [
          {
            existing_contact_id: newSelectedContactId,
            ...nestedOpRepFormData,
          },
        ],
      }));
    } catch (err) {
      setError("Failed to fetch contact data!" as any);
    }
  };

  const handleClearingExistingContact = () => {
    setExistingContactId("");
    setFormState((prevState: FormState) => ({
      ...prevState,
      new_operation_representative: [{}],
    }));
    setKey(Math.random()); // force re-render to clear the form
  };

  const handleChange = ({ formData: newFormData }: IChangeEvent) => {
    // setShowSubmitButton((prev) => prev === false);

    const newOperationRepresentative = newFormData.new_operation_representative;
    const newSelectedContactId =
      newOperationRepresentative[0]?.existing_contact_id;

    if (newSelectedContactId && newSelectedContactId !== existingContactId)
      handleSelectingContact(newSelectedContactId);
    else if (
      !newSelectedContactId &&
      existingContactId &&
      newOperationRepresentative[0] &&
      Object.keys(newOperationRepresentative[0]).length > 1
    )
      handleClearingExistingContact();
  };

  const submitHandler = async (data: any) => {
    // TODO: implement this
    console.log("submitHandler data", data);
  };

  return (
    <FormBase
      key={key}
      schema={createOperationRepresentativeSchema(
        existingOperationRepresentatives,
        contacts,
      )}
      uiSchema={createOperationRepresentativeUiSchema(
        Boolean(existingContactId),
      )}
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

export default NewOperationRepresentativeForm;

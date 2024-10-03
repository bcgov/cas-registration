"use client";

import {
  createOperationRepresentativeSchema,
  createOperationRepresentativeUiSchema,
} from "apps/registration/app/data/jsonSchema/operationRegistration/operationRepresentative";
import { OperationsContacts } from "apps/registration/app/components/operations/registration/types";
import { IChangeEvent } from "@rjsf/core";
import { useState } from "react";
import { Button, Alert } from "@mui/material";
import { getContact } from "@bciers/actions/api";
import {
  ContactFormData,
  ContactRow,
} from "@/administration/app/components/contacts/types";
import FormBase, { FormPropsWithTheme } from "@bciers/components/form/FormBase";
import { actionHandler } from "@bciers/actions";
import { UUID } from "crypto";
import SnackBar from "@bciers/components/form/components/SnackBar";

interface NewOperationRepresentativeFormProps
  extends Omit<FormPropsWithTheme<any>, "schema" | "uiSchema"> {
  step: number;
  operation: UUID;
  existingOperationRepresentatives: OperationsContacts[];
  contacts: ContactRow[];
}

const NewOperationRepresentativeForm: React.FC<
  NewOperationRepresentativeFormProps
> = (props) => {
  const {
    formData,
    operation,
    existingOperationRepresentatives,
    contacts,
    step,
  } = props;

  const [error, setError] = useState(undefined);
  const [formState, setFormState] = useState(formData);
  const [key, setKey] = useState(Math.random());
  const [existingContactId, setExistingContactId] = useState("");
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const isSubmitButton = formState?.new_operation_representative?.length > 0;
  const isExistingContactSelected =
    Boolean(existingContactId) &&
    formState?.new_operation_representative?.[0]?.existing_contact_id;

  const handleSelectingContact = async (newSelectedContactId: string) => {
    setExistingContactId(newSelectedContactId);
    try {
      const contactData: ContactFormData =
        await getContact(newSelectedContactId);

      setFormState({
        operation_representatives: formState.operation_representatives,
        new_operation_representative: [
          {
            existing_contact_id: newSelectedContactId,
            ...contactData,
          },
        ],
      });
    } catch (err) {
      setError("Failed to fetch contact data!" as any);
    }
  };

  const handleClearingExistingContact = () => {
    setExistingContactId("");
    setFormState({
      operation_representatives: formState.operation_representatives,
      new_operation_representative: [{}],
    });
    setKey(Math.random()); // force re-render to clear the form
  };

  const handleChange = ({ formData: newFormData }: IChangeEvent) => {
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
    ) {
      handleClearingExistingContact();
    } else {
      // This is needed to update the form data and show the submit button
      setFormState({
        operation_representatives: formState.operation_representatives,
        new_operation_representative: newOperationRepresentative,
      });
    }
  };

  const submitHandler = async ({ formData: newFormData }: IChangeEvent) => {
    const endpoint = `registration/v2/operations/${operation}/registration/operation-representative`;
    const response = await actionHandler(
      endpoint,
      "PUT",
      `/register-an-operation/${operation}/${step}`,
      {
        body: JSON.stringify({
          ...newFormData?.new_operation_representative[0],
        }),
      },
    );

    if (!response || response?.error) {
      setError(response.error);
      return { error: response.error };
    }
    // Refresh the page and refetch the updated operation representatives
    location.reload();
    setError(undefined);
    handleClearingExistingContact();
    setIsSnackbarOpen(true);
  };

  return (
    <>
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
        liveValidate={isExistingContactSelected}
      >
        <div>
          <div className="min-h-[48px] box-border">
            {error && <Alert severity="error">{error}</Alert>}
          </div>
          {isSubmitButton && (
            <Button className="mt-4" variant="outlined" type="submit">
              Save Operation Representative
            </Button>
          )}
        </div>
      </FormBase>
      <SnackBar
        isSnackbarOpen={isSnackbarOpen}
        message="Operation Representative saved successfully"
        setIsSnackbarOpen={setIsSnackbarOpen}
      />
    </>
  );
};

export default NewOperationRepresentativeForm;

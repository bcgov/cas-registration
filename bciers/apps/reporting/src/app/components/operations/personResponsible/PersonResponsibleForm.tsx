"use client";
import { useState } from "react";
import { RJSFSchema } from "@rjsf/utils";
import { IChangeEvent } from "@rjsf/core";
import { getContacts, getContact } from "@bciers/actions/api";
import {
  personResponsibleSchema,
  personResponsibleUiSchema,
} from "@reporting/src/data/jsonSchema/personResponsible";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import {
  Contact,
  ContactRow,
} from "@reporting/src/app/components/operations/types";
import { actionHandler } from "@bciers/actions";
import { createPersonResponsibleSchema } from "@reporting/src/app/components/operations/personResponsible/createPersonResponsibleSchema";
import { NavigationInformation } from "@reporting/src/app/components/taskList/types";
import { AddressErrorWidget } from "@reporting/src/data/jsonSchema/personResponsibleWidgets";
import SnackBar from "@bciers/components/form/components/SnackBar";

interface PersonResponsibleFormData {
  person_responsible: number | undefined;
}

interface Props {
  versionId: number;
  navigationInformation: NavigationInformation;
  contacts: { items: ContactRow[]; count: number } | null;
  initialContactId: number;
  personResponsible?: Contact | undefined;
  schema: RJSFSchema;
}

interface ComponentState {
  availableContacts: { items: ContactRow[]; count: number } | null;
  selectedContactId: number | undefined;
  contactToSubmit: Contact | undefined;
  schema: RJSFSchema;
  formData: PersonResponsibleFormData;
  hasError: boolean;
}

const PersonResponsibleForm = ({
  versionId,
  navigationInformation,
  contacts: initialContacts,
  personResponsible,
  schema: initialSchema,
  initialContactId,
}: Props) => {
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);

  const [componentState, setComponentState] = useState<ComponentState>({
    availableContacts: initialContacts,
    selectedContactId: initialContactId,
    contactToSubmit: personResponsible,
    schema: initialSchema,
    formData: {
      person_responsible: initialContactId || undefined,
    },
    hasError: false,
  });

  const updateContactShown = (
    newContactId: number | undefined,
    newContact: Contact | undefined,
  ) => {
    if (
      newContactId === componentState.selectedContactId &&
      newContact === componentState.contactToSubmit
    )
      return;

    const newComponentState = {
      ...componentState,
      selectedContactId: newContactId,
      contactToSubmit: newContact,
      hasError: false,
    };

    if (newContactId !== undefined && newContact) {
      // Check if any address field is missing or empty
      const missingAddressInfo =
        !newContact.street_address?.toString().trim() ||
        !newContact.municipality?.toString().trim() ||
        !newContact.province?.toString().trim() ||
        !newContact.postal_code?.toString().trim();
      const addressError = missingAddressInfo
        ? `Missing address information.  <a href="/administration/contacts/${newContact.id}?contacts_title=${newContact.first_name} ${newContact.last_name}/" target="_blank" rel="noopener noreferrer">Add contact's address information.</a>`
        : "";

      const updatedSchema = createPersonResponsibleSchema(
        personResponsibleSchema,
        componentState?.availableContacts?.items || [],
        newContactId,
        newContact,
        addressError,
      );

      newComponentState.hasError = Boolean(addressError);
      newComponentState.schema = updatedSchema;
      newComponentState.formData = {
        person_responsible: newContactId,
      };
    } else {
      newComponentState.formData = {
        person_responsible: undefined,
      };
    }

    setComponentState(newComponentState);
  };

  const handleChange = async (data: object) => {
    const changeEvent = data as IChangeEvent<PersonResponsibleFormData>;
    const selectedContactId = changeEvent.formData?.person_responsible;

    // We ignore changes where the name didn't change
    // And we already have the data to submit
    if (selectedContactId === componentState.formData.person_responsible)
      return;

    const selectedContact = componentState.availableContacts?.items.find(
      (contact) => contact.id === selectedContactId,
    );

    if (selectedContact) {
      const newContactFormData: Contact = await getContact(
        String(selectedContact.id),
      );

      updateContactShown(selectedContact.id, newContactFormData);
    } else {
      updateContactShown(undefined, undefined);
    }
  };

  const handleSave = async () => {
    // Do not proceed if there is an address error for the selected contact
    if (componentState.hasError) {
      return false;
    }
    const endpoint = `reporting/report-version/${versionId}/report-contact`;
    const pathToRevalidate = `reporting/reports/${versionId}/person-responsible`;
    const method = "POST";
    const payload = {
      ...componentState.contactToSubmit,
      contact_id: componentState.selectedContactId,
    };

    const response = await actionHandler(endpoint, method, pathToRevalidate, {
      body: JSON.stringify(payload),
    });

    // Check for errors
    if (response?.error) {
      return false;
    }
    // Return Success
    return true;
  };

  const handleSync = async () => {
    const updatedContacts = await getContacts();
    setIsSnackbarOpen(true);

    // If contact is selected, update form fields
    if (componentState.selectedContactId) {
      // Fetch the updated contact info based on the current selected contact
      const updatedContact: Contact = await getContact(
        String(componentState.selectedContactId),
      );

      // Update state with the updated contact information
      const updatedSchema = createPersonResponsibleSchema(
        personResponsibleSchema,
        updatedContacts.items,
        componentState.selectedContactId,
        updatedContact,
      );

      setComponentState({
        ...componentState,
        availableContacts: updatedContacts,
        contactToSubmit: updatedContact,
        schema: updatedSchema,
        formData: {
          person_responsible: componentState.selectedContactId,
        },
      });
    } else {
      // If no contact is selected, reset form fields
      setComponentState({
        availableContacts: updatedContacts.items,
        selectedContactId: undefined,
        contactToSubmit: undefined,
        hasError: false,
        schema: createPersonResponsibleSchema(
          personResponsibleSchema,
          updatedContacts.items,
        ),
        formData: {
          person_responsible: undefined,
        },
      });
    }
  };

  return (
    <>
      <MultiStepFormWithTaskList
        initialStep={navigationInformation.headerStepIndex}
        steps={navigationInformation.headerSteps}
        backUrl={navigationInformation.backUrl}
        continueUrl={navigationInformation.continueUrl}
        taskListElements={navigationInformation.taskList}
        schema={componentState.schema}
        uiSchema={{
          ...personResponsibleUiSchema,
          person_responsible: {
            ...personResponsibleUiSchema.person_responsible,
            "ui:enumNames": componentState.availableContacts?.items.map(
              (contact) => `${contact.first_name} ${contact.last_name}`,
            ),
          },
          sync_button: {
            ...personResponsibleUiSchema.sync_button,
            "ui:options": {
              onSync: handleSync,
            },
          },
          contact_details: {
            ...personResponsibleUiSchema.contact_details,
            section4: {
              ...personResponsibleUiSchema.contact_details.section4,
              address_error: {
                ...personResponsibleUiSchema.contact_details.section4
                  .address_error,
                "ui:widget": AddressErrorWidget,
              },
            },
          },
        }}
        formData={componentState.formData}
        onChange={handleChange}
        onSubmit={handleSave}
      />
      <SnackBar
        isSnackbarOpen={isSnackbarOpen}
        message="Changes synced successfully"
        setIsSnackbarOpen={setIsSnackbarOpen}
      />
    </>
  );
};

export default PersonResponsibleForm;

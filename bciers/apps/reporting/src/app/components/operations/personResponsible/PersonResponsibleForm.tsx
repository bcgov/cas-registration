"use client";
import { useState, useEffect } from "react";
import { RJSFSchema } from "@rjsf/utils";
import { getContacts } from "@bciers/actions/api";
import { getContact } from "@bciers/actions/api";
import debounce from "lodash.debounce";
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

interface Props {
  versionId: number;
  navigationInformation: NavigationInformation;
  contacts: { items: ContactRow[]; count: number } | null;
  personResponsible?: Contact | null;
  schema: RJSFSchema;
}

const PersonResponsibleForm = ({
  versionId,
  navigationInformation,
  contacts: initialContacts,
  personResponsible,
  schema: initialSchema,
}: Props) => {
  const [contacts, setContacts] =
    useState<typeof initialContacts>(initialContacts);
  const [selectedContactId, setSelectedContactId] = useState<number>();
  const [selectedContactAddressError, setSelectedContactAddressError] =
    useState<string>();
  const [contactFormData, setContactFormData] = useState<any>();
  const [formData, setFormData] = useState({
    person_responsible: personResponsible
      ? `${personResponsible.first_name} ${personResponsible.last_name}`
      : "",
  });
  const [schema, setSchema] = useState<RJSFSchema>(initialSchema);

  // Update schema whenever selectedContactId or contactFormData changes
  useEffect(() => {
    if (selectedContactId !== null && contactFormData) {
      const updatedSchema = createPersonResponsibleSchema(
        personResponsibleSchema,
        contacts?.items || [],
        selectedContactId,
        contactFormData,
        selectedContactAddressError,
      );
      setSchema(updatedSchema);
    }
  }, [selectedContactId, contactFormData]);

  const handleContactSelect = debounce(async (e: any) => {
    const selectedFullName = e.formData?.person_responsible;

    const selectedContact = contacts?.items.find(
      (contact) =>
        `${contact.first_name} ${contact.last_name}` === selectedFullName,
    );

    if (selectedContact) {
      const newSelectedContactId = selectedContact.id;
      const newContactFormData: Contact = await getContact(
        `${selectedContact.id}`,
      );
      // Check if any address field is missing or empty
      const missingAddressInfo =
        !newContactFormData.street_address?.toString().trim() ||
        !newContactFormData.municipality?.toString().trim() ||
        !newContactFormData.province?.toString().trim() ||
        !newContactFormData.postal_code?.toString().trim();
      const addressError = missingAddressInfo
        ? `Missing address information.  <a href="/administration/contacts/${newContactFormData.id}?contacts_title=${newContactFormData.first_name} ${newContactFormData.last_name}/" target="_blank" rel="noopener noreferrer">Add contact's address information.</a>`
        : "";
      setSelectedContactAddressError(addressError);
      setSelectedContactId(newSelectedContactId);
      setContactFormData(newContactFormData);
      setFormData({
        person_responsible: `${newContactFormData?.first_name || ""} ${
          newContactFormData?.last_name || ""
        }`.trim(),
      });
    } else {
      setSelectedContactId(undefined);
      setContactFormData(undefined);
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        person_responsible: "", // Reset to empty string if no contact is selected
      }));
    }
  }, 300);

  const handleSave = async () => {
    // Do not proceed if there is an address error for the selected contact
    if (selectedContactAddressError) {
      return false;
    }
    const endpoint = `reporting/report-version/${versionId}/report-contact`;
    const method = "POST";
    const payload = {
      report_version: versionId,
      ...contactFormData,
    };

    const response = await actionHandler(endpoint, method, "", {
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
    setContacts(updatedContacts);

    // If contact is selected, update form fields
    if (selectedContactId) {
      // Fetch the updated contact info based on the current selected contact
      const updatedContact: Contact = await getContact(`${selectedContactId}`);
      // Update state with the updated contact information
      setContactFormData(updatedContact);
      setFormData({
        person_responsible:
          `${updatedContact.first_name} ${updatedContact.last_name}`.trim(),
      });
    } else {
      // If no contact is selected, reset form fields
      setSelectedContactAddressError(undefined);
      setSelectedContactId(undefined);
      setContactFormData(undefined);
      setFormData({ person_responsible: "" });

      const updatedSchema = createPersonResponsibleSchema(
        personResponsibleSchema,
        updatedContacts.items,
      );
      setSchema(updatedSchema);
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
        schema={schema}
        uiSchema={{
          ...personResponsibleUiSchema,
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
        formData={formData}
        onChange={handleContactSelect}
        onSubmit={handleSave}
      />
    </>
  );
};

export default PersonResponsibleForm;

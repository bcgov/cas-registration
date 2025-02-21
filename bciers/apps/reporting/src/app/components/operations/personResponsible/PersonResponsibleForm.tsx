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
import { multiStepHeaderSteps } from "@reporting/src/app/components/taskList/multiStepHeaderConfig";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { OperationTypes } from "@bciers/utils/src/enums";

interface Props {
  versionId: number;
  facilityId: number;
  operationType: string;
  taskListElements: TaskListElement[];
  contacts: { items: ContactRow[]; count: number } | null;
  personResponsible?: Contact | null;
  schema: RJSFSchema;
}

const PersonResponsibleForm = ({
  versionId,
  facilityId,
  operationType,
  taskListElements,
  contacts: initialContacts,
  personResponsible,
  schema: initialSchema,
}: Props) => {
  const [contacts, setContacts] =
    useState<typeof initialContacts>(initialContacts);
  const [selectedContactId, setSelectedContactId] = useState<number>();
  const [contactFormData, setContactFormData] = useState<any>();
  const [formData, setFormData] = useState({
    person_responsible: personResponsible
      ? `${personResponsible.first_name} ${personResponsible.last_name}`
      : "",
  });
  const [schema, setSchema] = useState<RJSFSchema>(initialSchema);

  const continueUrl =
    operationType === OperationTypes.LFO
      ? `/reports/${versionId}/facilities/review-facilities`
      : `/reports/${versionId}/facilities/${facilityId}/activities`;
  const backUrl = `/reports/${versionId}/review-operator-data`;

  // Update schema whenever selectedContactId or contactFormData changes
  useEffect(() => {
    if (selectedContactId !== null && contactFormData) {
      const updatedSchema = createPersonResponsibleSchema(
        personResponsibleSchema,
        contacts?.items || [],
        selectedContactId,
        contactFormData,
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
    setSelectedContactId(undefined);
    setContactFormData(undefined);
    setFormData({ person_responsible: "" });

    const updatedSchema = createPersonResponsibleSchema(
      personResponsibleSchema,
      updatedContacts.items,
    );
    setSchema(updatedSchema);
  };

  return (
    <>
      <MultiStepFormWithTaskList
        initialStep={0}
        steps={multiStepHeaderSteps}
        backUrl={backUrl}
        continueUrl={continueUrl}
        taskListElements={taskListElements}
        schema={schema}
        uiSchema={{
          ...personResponsibleUiSchema,
          sync_button: {
            ...personResponsibleUiSchema.sync_button,
            "ui:options": {
              onSync: handleSync,
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

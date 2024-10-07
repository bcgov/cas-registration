"use client";
import { useState, useEffect } from "react";
import { RJSFSchema } from "@rjsf/utils";
import { getContacts } from "@bciers/actions/api";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import {
  personResponsibleSchema,
  personResponsibleUiSchema,
} from "@reporting/src/data/jsonSchema/personResponsible";
import getContact from "@/administration/app/components/contacts/getContact";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import {
  Contact,
  ContactRow,
} from "@reporting/src/app/components/operations/types";
import { useRouter } from "next/navigation";
import { actionHandler } from "@bciers/actions";
import { createPersonResponsibleSchema } from "@reporting/src/app/components/operations/personResponsible/createPersonResponsibleSchema";

interface Props {
  version_id: number;
}

const taskListElements: TaskListElement[] = [
  {
    type: "Section",
    title: "Operation information",
    isExpanded: true,
    elements: [
      { type: "Page", title: "Review Operation information", isChecked: true },
      {
        type: "Page",
        title: "Person responsible",
        isActive: true,
        link: "/reports",
      },
      { type: "Page", title: "Review facilities" },
    ],
  },
];

const PersonResponsible = ({ version_id }: Props) => {
  const [contacts, setContacts] = useState<{
    items: ContactRow[];
    count: number;
  } | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<number | null>(
    null,
  );
  const [contactFormData, setContactFormData] = useState<any>(null);
  const [formData, setFormData] = useState<any>({}); // Track overall form data
  const [schema, setSchema] = useState<RJSFSchema>(personResponsibleSchema);
  const router = useRouter();
  const saveAndContinueUrl = `/reports/${version_id}/review-facilities`;
  useEffect(() => {
    const fetchContacts = async () => {
      const contactData = await getContacts();
      setContacts(contactData);
      const initialSchema = createPersonResponsibleSchema(
        personResponsibleSchema,
        contactData.items,
        null,
      );
      setSchema(initialSchema);
    };

    fetchContacts();
  }, []);

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

  const handleContactSelect = async (e: any) => {
    const selectedFullName = e.formData?.person_responsible;

    // Safeguard against undefined or empty contacts
    if (!contacts || !contacts.items) {
      console.error("Contacts data is not available or empty");
      return;
    }

    const selectedContact = contacts.items.find(
      (contact) =>
        `${contact.first_name} ${contact.last_name}` === selectedFullName,
    );

    if (selectedContact) {
      const newSelectedContactId = selectedContact.id;

      // Assume getContact always resolves or has built-in error handling
      const newContactFormData: Contact = await getContact(
        `${selectedContact.id}`,
      );

      // Only update state if the selected contact information changes
      if (
        newSelectedContactId !== selectedContactId ||
        newContactFormData !== contactFormData
      ) {
        setSelectedContactId(newSelectedContactId);
        setContactFormData(newContactFormData);
        setFormData((prevFormData: any) => ({
          ...prevFormData,
          person_responsible: `${newContactFormData.first_name} ${newContactFormData.last_name}`,
        }));
      }
    } else {
      // Handle case where no contact matches the selected full name
      setSelectedContactId(null);
      setContactFormData(null);
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        person_responsible: null,
      }));
    }
  };

  const handleSubmit = async () => {
    const endpoint = `reporting/report-version/${version_id}/report-contact`;
    const method = "POST";

    const payload = {
      report_version: version_id,
      ...contactFormData, // Spread contactFormData to include all fields
    };

    const response = await actionHandler(endpoint, method, endpoint, {
      body: JSON.stringify(payload),
    });

    // Handle response
    if (response) {
      router.push(`${saveAndContinueUrl}`);
    }
  };

  return (
    <>
      <MultiStepFormWithTaskList
        initialStep={0}
        steps={[
          "Review Operation information",
          "Person responsible",
          "Review facilities",
        ]}
        cancelUrl={"/reports"}
        taskListElements={taskListElements}
        schema={schema}
        uiSchema={personResponsibleUiSchema}
        formData={formData}
        onChange={handleContactSelect}
        onSubmit={handleSubmit}
        submitButtonDisabled={!selectedContactId}
      />
    </>
  );
};

export default PersonResponsible;

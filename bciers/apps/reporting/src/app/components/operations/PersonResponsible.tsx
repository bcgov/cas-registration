"use client";
import { useState, useEffect } from "react";
import { RJSFSchema } from "@rjsf/utils";
import { ContactRow } from "@/administration/app/components/contacts/types";
import { getContacts } from "@bciers/actions/api";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import {
  createContactDetailsProperties,
  personResponsibleSchema,
  personResponsibleUiSchema,
} from "@reporting/src/data/jsonSchema/personResponsible";
import getContact from "@/administration/app/components/contacts/getContact";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";

const taskListElements: TaskListElement[] = [
  {
    type: "Section",
    title: "Operation information",
    isExpanded: true,
    elements: [
      { type: "Page", title: "Review Operation information", isChecked: true },
      { type: "Page", title: "Person responsible", isActive: true },
      { type: "Page", title: "Review facilities" },
    ],
  },
];

const createPersonResponsibleSchema = (
  schema: RJSFSchema,
  contactOptions: {
    id: number;
    first_name: string;
    last_name: string;
  }[],
  contactId: number | null, // Accept the contactId as a parameter
  contactFormData: {
    first_name: any;
    last_name: any;
    position_title: any;
    email: any;
    phone_number: any;
    street_address: any;
    municipality: any;
    province: any;
    postal_code: any;
  },
) => {
  const localSchema = JSON.parse(JSON.stringify(schema));

  if (Array.isArray(contactOptions)) {
    // Set up enum values (display names)
    localSchema.properties.person_responsible.enum = contactOptions.map(
      (contact) => `${contact.first_name} ${contact.last_name}`,
    );
  }

  // Conditionally add contact schema if contactId exists
  if (contactId && contactFormData) {
    localSchema.properties.contact_details =
      createContactDetailsProperties(contactFormData);
  }

  return localSchema;
};

const PersonResponsible = () => {
  const [contacts, setContacts] = useState<{
    items: ContactRow[];
    count: number;
  } | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<number | null>(
    null,
  );
  const [contactFormData, setContactFormData] = useState<any>(null);
  const [formData, setFormData] = useState<any>({}); // Track overall form data
  const [schema, setSchema] = useState<RJSFSchema>(personResponsibleSchema); // State for schema

  // Fetch contacts when the component mounts
  useEffect(() => {
    const fetchContacts = async () => {
      const contactData = await getContacts();
      setContacts(contactData);
      const initialSchema = createPersonResponsibleSchema(
        personResponsibleSchema,
        contactData.items,
        null,
        {
          first_name: "",
          last_name: "",
          position_title: "",
          email: "",
          phone_number: "",
          street_address: "",
          municipality: "",
          province: "",
          postal_code: "",
        },
      );
      setSchema(initialSchema); // Update schema with contacts
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
      setSchema(updatedSchema); // Update schema
    }
  }, [selectedContactId]);

  // Handle contact selection
  const handleContactSelect = async (e: any) => {
    const selectedFullName = e.formData?.person_responsible;
    const selectedContact = contacts?.items.find(
      (contact) =>
        `${contact.first_name} ${contact.last_name}` === selectedFullName,
    );

    if (selectedContact) {
      const newSelectedContactId = selectedContact.id;
      const newContactFormData = await getContact(`${selectedContact.id}`); // Fetch contact data

      // Only update state if selected contact information actually changes
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
      // Reset the contact form data if no contact is selected
      setSelectedContactId(null);
      setContactFormData(null);
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        person_responsible: null,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    console.log(contactFormData);
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
        onChange={handleContactSelect} // Call onChange for the contact selection
        onSubmit={handleSubmit}
        submitButtonDisabled={!selectedContactId}
      />
    </>
  );
};

export default PersonResponsible;

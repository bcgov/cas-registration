"use client";
import { useState, useEffect } from "react";
import { RJSFSchema } from "@rjsf/utils";
import { getContacts } from "@bciers/actions/api";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import debounce from "lodash.debounce";
import {
  personResponsibleSchema,
  personResponsibleUiSchema,
} from "@reporting/src/data/jsonSchema/personResponsible";
import getContact from "@reporting/src/app/utils/getContact";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import {
  Contact,
  ContactRow,
} from "@reporting/src/app/components/operations/types";
import { useRouter } from "next/navigation";
import { actionHandler } from "@bciers/actions";
import { createPersonResponsibleSchema } from "@reporting/src/app/components/operations/personResponsible/createPersonResponsibleSchema";
import { getReportingPersonResponsible } from "@reporting/src/app/utils/getReportingPersonResponsible";

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
  const [formData, setFormData] = useState({
    person_responsible: "", // Default to empty string
  });

  const [schema, setSchema] = useState<RJSFSchema>(personResponsibleSchema);
  const router = useRouter();
  const saveAndContinueUrl = `/reports/${version_id}/review-facilities`;

  useEffect(() => {
    const fetchData = async () => {
      const contactData = await getContacts();
      setContacts(contactData);

      const personResponsibleData =
        await getReportingPersonResponsible(version_id);
      if (contactData) {
        const matchingContact = contactData.items.find(
          (contact: { first_name: string; last_name: string }) =>
            contact.first_name === personResponsibleData.first_name &&
            contact.last_name === personResponsibleData.last_name,
        );

        if (matchingContact) {
          setSelectedContactId(matchingContact.id);
          const newContactFormData: Contact = await getContact(
            `${matchingContact.id}`,
          );
          setContactFormData(newContactFormData);
          setFormData({
            person_responsible: `${newContactFormData?.first_name} ${newContactFormData?.last_name}`,
          });
        }
      }

      const initialSchema = createPersonResponsibleSchema(
        personResponsibleSchema,
        contactData?.items,
        selectedContactId,
      );
      setSchema(initialSchema);
    };

    fetchData();
  }, [version_id]);

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
      setSelectedContactId(null);
      setContactFormData(null);
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        person_responsible: "", // Reset to empty string if no contact is selected
      }));
    }
  }, 300);

  const handleSubmit = async () => {
    const endpoint = `reporting/report-version/${version_id}/report-contact`;
    const method = "POST";

    const payload = {
      report_version: version_id,
      ...contactFormData,
    };

    const response = await actionHandler(endpoint, method, endpoint, {
      body: JSON.stringify(payload),
    });

    if (response) {
      router.push(`${saveAndContinueUrl}`);
    }
  };

  return (
    <>
      <MultiStepFormWithTaskList
        initialStep={0}
        steps={[
          "Operation Information",
          "Report Information",
          "Additional Information",
          "Compliance Summary",
          "Sign-off & Submit",
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

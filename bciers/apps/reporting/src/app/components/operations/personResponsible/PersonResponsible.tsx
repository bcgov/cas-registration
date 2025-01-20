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
import { getReportingPersonResponsible } from "@reporting/src/app/utils/getReportingPersonResponsible";
import { getFacilityReport } from "@reporting/src/app/utils/getFacilityReport";
import { multiStepHeaderSteps } from "@reporting/src/app/components/taskList/multiStepHeaderConfig";
import {
  ActivePage,
  getOperationInformationTaskList,
} from "@reporting/src/app/components/taskList/1_operationInformation";

interface Props {
  version_id: number;
}

const PersonResponsible = ({ version_id }: Props) => {
  const [contacts, setContacts] = useState<{
    items: ContactRow[];
    count: number;
  } | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<number>();
  const [contactFormData, setContactFormData] = useState<any>();
  const [formData, setFormData] = useState({
    person_responsible: "", // Default to empty string
  });
  const [facilityId, setFacilityId] = useState<number>();
  const [operationType, setOperationType] = useState<string>();

  const [schema, setSchema] = useState<RJSFSchema>(personResponsibleSchema);

  const continueUrl =
    operationType === "Linear Facility Operation"
      ? `/reports/${version_id}/review-facilities-list`
      : `/reports/${version_id}/facilities/${facilityId}/activities`;
  const backUrl = `/reports/${version_id}/review-operator-data`;

  useEffect(() => {
    const fetchData = async () => {
      const contactData = await getContacts();
      setContacts(contactData);

      const personResponsibleData =
        await getReportingPersonResponsible(version_id);
      if (personResponsibleData && contactData) {
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

  useEffect(() => {
    const getFacilityId = async () => {
      const facilityReport = await getFacilityReport(version_id);
      if (facilityReport?.facility_id) {
        setFacilityId(facilityReport.facility_id);
        setOperationType(facilityReport.operation_type);
      } else {
        setFacilityId(undefined);
        setOperationType(undefined);
      }
    };
    getFacilityId();
  }, []);

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
    const endpoint = `reporting/report-version/${version_id}/report-contact`;
    const method = "POST";
    const payload = {
      report_version: version_id,
      ...contactFormData,
    };

    const response = await actionHandler(endpoint, method, "", {
      body: JSON.stringify(payload),
    });

    return response && !response.error;
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
        taskListElements={getOperationInformationTaskList(
          version_id,
          ActivePage.PersonResponsible,
          operationType,
        )}
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

export default PersonResponsible;

import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import PersonResponsibleForm from "./PersonResponsibleForm";
import { getFacilityReport } from "@reporting/src/app/utils/getFacilityReport";
import { getContacts } from "@bciers/actions/api";
import { getReportingPersonResponsible } from "@reporting/src/app/utils/getReportingPersonResponsible";
import { createPersonResponsibleSchema } from "@reporting/src/app/components/operations/personResponsible/createPersonResponsibleSchema";
import { personResponsibleSchema } from "@reporting/src/data/jsonSchema/personResponsible";
import { HeaderStep, ReportingPage } from "../../taskList/types";
import { getNavigationInformation } from "../../taskList/navigationInformation";

export default async function PersonResponsiblePage({
  version_id,
}: HasReportVersion) {
  // 🚀 Fetch async data for person responsible form
  const facilityReport = await getFacilityReport(version_id);
  const facilityId = facilityReport.facility_id;

  const navInfo = await getNavigationInformation(
    HeaderStep.OperationInformation,
    ReportingPage.PersonResponsible,
    version_id,
    facilityId,
  );

  const contactData = await getContacts();
  const personResponsibleData = await getReportingPersonResponsible(version_id);

  // Determine selected contact if personResponsible exists
  const selectedContact = contactData?.items.find(
    (contact: { first_name: any; last_name: any }) =>
      personResponsibleData?.first_name === contact.first_name &&
      personResponsibleData?.last_name === contact.last_name,
  );

  const selectedContactId = selectedContact?.id;
  const contactFormData = selectedContact || personResponsibleData;

  // Move schema creation to the server
  const schema = createPersonResponsibleSchema(
    personResponsibleSchema,
    contactData?.items ?? [],
    selectedContactId,
    contactFormData,
  );

  return (
    <PersonResponsibleForm
      versionId={version_id}
      navigationInformation={navInfo}
      contacts={contactData}
      personResponsible={personResponsibleData}
      schema={schema}
    />
  );
}

import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import PersonResponsibleForm from "./PersonResponsibleForm";
import { getFacilityReport } from "@reporting/src/app/utils/getFacilityReport";
import { getContacts } from "@bciers/actions/api";
import { getReportingPersonResponsible } from "@reporting/src/app/utils/getReportingPersonResponsible";
import { createPersonResponsibleSchema } from "@reporting/src/app/components/operations/personResponsible/createPersonResponsibleSchema";
import { personResponsibleSchema } from "@reporting/src/data/jsonSchema/personResponsible";
import {
  HeaderStep,
  ReportingPage,
} from "@reporting/src/app/components/taskList/types";
import { getNavigationInformation } from "@reporting/src/app/components/taskList/navigationInformation";
import {
  Contact,
  ContactRow,
} from "@reporting/src/app/components/operations/types";

export default async function PersonResponsiblePage({
  version_id,
}: HasReportVersion) {
  // Fetch facility report information required for navigation
  const facilityReport = await getFacilityReport(version_id);
  const facilityId = facilityReport.facility_id;

  // Fetch task list/navigation information
  const navInfo = await getNavigationInformation(
    HeaderStep.OperationInformation,
    ReportingPage.PersonResponsible,
    version_id,
    facilityId,
  );

  // Fetch currently available Registration contacts
  const contactData = await getContacts();

  // Fetch the saved report snapshot data for person responsible
  const personResponsibleData: Contact | undefined =
    await getReportingPersonResponsible(version_id);

  // Current selectable contacts returned from Registration
  const contacts: ContactRow[] = contactData?.items ?? [];

  // Saved reference to the originally selected contact
  const savedContactId = personResponsibleData?.contact_id;

  // Determine whether the saved contact still exists
  const selectedContactExists =
    savedContactId !== undefined &&
    contacts.some((contact) => contact.id === savedContactId);

  // If the original contact no longer exists, create a temporary
  // snapshot-based dropdown option so the form can still display
  const snapshotContactOption: ContactRow | undefined =
    personResponsibleData &&
    personResponsibleData.contact_id !== null &&
    personResponsibleData.contact_id !== undefined &&
    !selectedContactExists
      ? {
          id: personResponsibleData.contact_id,
          first_name: personResponsibleData.first_name ?? "",
          last_name: personResponsibleData.last_name ?? "",
          email: personResponsibleData.email ?? "",
        }
      : undefined;

  // Merge the snapshot contact into the available contact options
  // so the previously selected value still appears in the dropdown
  const contactsWithSnapshot: ContactRow[] = snapshotContactOption
    ? [...contacts, snapshotContactOption]
    : contacts;

  // Create the schema server-side using the merged contact list
  const schema = createPersonResponsibleSchema(
    personResponsibleSchema,
    contactsWithSnapshot,
    savedContactId,
    personResponsibleData,
  );

  return (
    <PersonResponsibleForm
      versionId={version_id}
      navigationInformation={navInfo}
      contacts={{
        items: contactsWithSnapshot,
        count: contactsWithSnapshot.length,
      }}
      personResponsible={personResponsibleData}
      schema={schema}
      initialContactId={savedContactId}
    />
  );
}

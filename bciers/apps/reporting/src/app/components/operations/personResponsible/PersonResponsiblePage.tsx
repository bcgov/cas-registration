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

export default async function PersonResponsiblePage({
  version_id,
}: HasReportVersion) {
  // Fetch async data for person responsible form
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
  const selectedContactId =
    personResponsibleData?.contact_id ??
    contactData?.items.find(
      (c: any) => c.email === personResponsibleData?.email,
    )?.id;

  // Move schema creation to the server
  const schema = createPersonResponsibleSchema(
    personResponsibleSchema,
    contactData?.items ?? [],
    selectedContactId,
    personResponsibleData,
  );

  return (
    <PersonResponsibleForm
      versionId={version_id}
      navigationInformation={navInfo}
      contacts={contactData}
      personResponsible={personResponsibleData}
      schema={schema}
      initialContactId={selectedContactId}
    />
  );
}

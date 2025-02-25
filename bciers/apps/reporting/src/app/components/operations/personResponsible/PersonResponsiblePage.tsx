import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import PersonResponsibleForm from "./PersonResponsibleForm";
import {
  ActivePage,
  getOperationInformationTaskList,
} from "@reporting/src/app/components/taskList/1_operationInformation";
import { getFacilityReport } from "@reporting/src/app/utils/getFacilityReport";
import { getContacts } from "@bciers/actions/api";
import { getReportingPersonResponsible } from "@reporting/src/app/utils/getReportingPersonResponsible";
import { createPersonResponsibleSchema } from "@reporting/src/app/components/operations/personResponsible/createPersonResponsibleSchema";
import { personResponsibleSchema } from "@reporting/src/data/jsonSchema/personResponsible";

export default async function PersonResponsiblePage({
  version_id,
}: HasReportVersion) {
  // 🚀 Fetch async data for person responsible form
  const facilityReport = await getFacilityReport(version_id);
  const facilityId = facilityReport.facility_id;
  const operationType = facilityReport.operation_type;
  const taskListElements = await getOperationInformationTaskList(
    version_id,
    ActivePage.PersonResponsible,
    operationType,
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
      facilityId={facilityId}
      operationType={operationType}
      taskListElements={taskListElements}
      contacts={contactData}
      personResponsible={personResponsibleData}
      schema={schema}
    />
  );
}

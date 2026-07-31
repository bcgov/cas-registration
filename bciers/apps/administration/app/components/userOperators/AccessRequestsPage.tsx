import { AccessRequestDataGridRow } from "apps/administration/app/components/userOperators/types";
import getAccessRequests from "apps/administration/app/components/userOperators/getAccessRequests";
import AccessRequestDataGrid from "apps/administration/app/components/userOperators/AccessRequestDataGrid";
import processAccessRequestData from "apps/administration/app/components/userOperators/processAccessRequestData";

export default async function AccessRequestsPage() {
  const accessRequestData = await getAccessRequests();

  const processedAccessRequestData: { rows: AccessRequestDataGridRow[] } | [] =
    await processAccessRequestData(accessRequestData);
  return <AccessRequestDataGrid initialData={processedAccessRequestData} />;
}

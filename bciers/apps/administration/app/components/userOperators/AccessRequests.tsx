import { AccessRequestDataGridRow } from "apps/administration/app/components/userOperators/types";
import getAccessRequests from "apps/administration/app/components/userOperators/getAccessRequests";
import AccessRequestDataGrid from "apps/administration/app/components/userOperators/AccessRequestDataGrid";
import processAccessRequestData from "apps/administration/app/components/userOperators/processAccessRequestData";

// 🧩 Main component
export default async function AccessRequests() {
  const accessRequestData = await getAccessRequests();

  if (!accessRequestData || "error" in accessRequestData)
    throw new Error("Failed to retrieve access requests.");

  const processedAccessRequestData: { rows: AccessRequestDataGridRow[] } | [] =
    await processAccessRequestData(accessRequestData);
  return <AccessRequestDataGrid initialData={processedAccessRequestData} />;
}

import { getInternalAccessRequests } from "@bciers/actions/api";
import InternalAccessRequestDataGrid from "./InternalAccessRequestDataGrid";

export default async function InternalAccessRequestsPage() {
  const internalAccessRequestData = await getInternalAccessRequests();

  return (
    <InternalAccessRequestDataGrid
      initialData={{
        rows: internalAccessRequestData,
        row_count: internalAccessRequestData.length,
      }}
    />
  );
}

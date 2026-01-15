import { getInternalAccessRequests } from "@bciers/actions/api";
import InternalAccessRequestDataGrid from "./InternalAccessRequestDataGrid";

export default async function InternalAccessRequestsPage() {
  const internalAccessRequestData = await getInternalAccessRequests();

  if (!internalAccessRequestData || "error" in internalAccessRequestData)
    throw new Error("Failed to retrieve internal access requests.");

  return (
    <InternalAccessRequestDataGrid
      initialData={{
        rows: internalAccessRequestData,
        row_count: internalAccessRequestData.length,
      }}
    />
  );
}

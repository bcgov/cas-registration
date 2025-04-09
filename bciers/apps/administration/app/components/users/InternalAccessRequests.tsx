import { getInternalAccessRequests } from "@bciers/actions/api";
import InternalAccessRequestDataGrid from "./InternalAccessRequestDataGrid";

// 🧩 Main component
export default async function InternalAccessRequests() {
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

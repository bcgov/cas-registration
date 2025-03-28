import InternalAccessRequestDataGrid from "./InternalAccessRequestDataGrid";
import getInternalAccessRequests from "./getInteralAccessRequests";

// 🧩 Main component
export default async function InternalAccessRequests() {
  const internalAccessRequestData = await getInternalAccessRequests();
  console.log("internalAccessRequestData", internalAccessRequestData);

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

import InternalAccessRequestDataGrid from "./InternalAccessRequestDataGrid";
import getInternalAccessRequests from "./getInteralAccessRequests";

// 🧩 Main component
export default async function InternalAccessRequests() {
  const internalAccessRequestData = await getInternalAccessRequests();

  if (!internalAccessRequestData || "error" in internalAccessRequestData)
    throw new Error("Failed to retrieve access requests.");

  return (
    <InternalAccessRequestDataGrid initialData={internalAccessRequestData} />
  );
}

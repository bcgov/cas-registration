import OperationDataGrid from "./OperationDataGrid";
import { OperationRow, OperationsSearchParams } from "./types";
import fetchOperationsPageData from "./fetchOperationsPageData";

// 🧩 Main component
export default async function Operations({
  searchParams,
  role,
}: {
  searchParams: OperationsSearchParams;
  role: string | undefined;
}) {
  // Fetch operations data
  const operations: {
    rows: OperationRow[];
    row_count: number;
  } = await fetchOperationsPageData(searchParams);
  if (!operations) {
    return <div>No operations data in database.</div>;
  }

  const isAuthorizedAdminUser =
    role?.includes("cas") && !role?.includes("pending");

  // Render the DataGrid component
  return (
    <div className="mt-5">
      <OperationDataGrid
        initialData={operations}
        isInternalUser={isAuthorizedAdminUser}
      />
    </div>
  );
}

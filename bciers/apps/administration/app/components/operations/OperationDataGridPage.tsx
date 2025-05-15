import OperationDataGrid from "./OperationDataGrid";
import { OperationRow, OperationsSearchParams } from "./types";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonGrid";
import { getSessionRole } from "@bciers/utils/src/sessionUtils";
import { fetchOperationsPageData } from "@bciers/actions/api";

// 🧩 Main component
export default async function OperationDataGridPage({
  searchParams,
}: {
  searchParams: OperationsSearchParams;
}) {
  const role = await getSessionRole();
  const isInternalUser = role.includes("cas_");

  // IRC users should only see Registered operations
  const filteredSearchParams = isInternalUser
    ? { ...searchParams, operation__status: "Registered" }
    : searchParams;

  // Fetch operations data
  const operations: {
    rows: OperationRow[];
    row_count: number;
  } = await fetchOperationsPageData(filteredSearchParams);
  if (!operations || "error" in operations)
    throw new Error("Failed to retrieve operations");

  // Render the DataGrid component
  return (
    <Suspense fallback={<Loading />}>
      <div className="mt-5">
        <OperationDataGrid
          initialData={operations}
          isInternalUser={isInternalUser}
          filteredSearchParams={filteredSearchParams}
        />
      </div>
    </Suspense>
  );
}

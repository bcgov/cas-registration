import OperationDataGrid from "./OperationDataGrid";
import { OperationRow, OperationsSearchParams } from "./types";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonGrid";

// 🧩 Main component
export default async function OperationDataGridPage({
  isInternalUser,
  initialData,
  filteredSearchParams,
}: {
  isInternalUser: boolean;
  initialData: {
    rows: OperationRow[];
    row_count: number;
  };
  filteredSearchParams: OperationsSearchParams;
}) {
  // Render the DataGrid component
  return (
    <Suspense fallback={<Loading />}>
      <div className="mt-5">
        <OperationDataGrid
          initialData={initialData}
          isInternalUser={isInternalUser}
          filteredSearchParams={filteredSearchParams}
        />
      </div>
    </Suspense>
  );
}

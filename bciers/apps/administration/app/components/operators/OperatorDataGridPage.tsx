import { OperatorRow, OperatorsSearchParams } from "./types";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonGrid";
import OperatorDataGrid from "./OperatorDataGrid";
import fetchOperatorsPageData from "./fetchOperatorsPageData";

// 🧩 Main component
export default async function Operators({
  searchParams,
}: {
  searchParams: OperatorsSearchParams;
}) {
  // Fetch operations data
  const operators: {
    rows: OperatorRow[];
    row_count: number;
  } = await fetchOperatorsPageData(searchParams);
  if (!operators || "error" in operators)
    throw new Error("Failed to retrieve operators");

  // Render the DataGrid component
  return (
    <Suspense fallback={<Loading />}>
      <div className="mt-5">
        <OperatorDataGrid initialData={operators} />
      </div>
    </Suspense>
  );
}

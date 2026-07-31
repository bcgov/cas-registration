import {
  OperatorRow,
  OperatorsSearchParams,
} from "@/administration/app/components/operators/types";
import OperatorsDataGrid from "@/administration/app/components/operators/OperatorsDataGrid";
import fetchOperatorsPageData from "@/administration/app/components/operators/fetchOperatorsPageData";

// 🧩 Main component
export default async function OperatorsPage({
  searchParams,
}: {
  searchParams: OperatorsSearchParams;
}) {
  // Fetch operations data
  const operators: {
    rows: OperatorRow[];
    row_count: number;
  } = await fetchOperatorsPageData(searchParams);

  // Render the DataGrid component
  return (
    <div className="mt-5">
      <OperatorsDataGrid initialData={operators} />
    </div>
  );
}

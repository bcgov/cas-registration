import OperationDataGrid from "./OperationDataGrid";
import { OperationRow, OperationsSearchParams } from "./types";
import { fetchOperationsPageData } from "./fetchOperationsPageData";
import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";

// 🧩 Main component
export default async function Operations({
  searchParams,
}: {
  searchParams: OperationsSearchParams;
}) {
  // Fetch operations data
  const operations: {
    rows: OperationRow[];
    row_count: number;
  } = await fetchOperationsPageData(searchParams);

  const reportingYear = await getReportingYear();

  if (!operations) {
    return <div>No operations data in database.</div>;
  }
  // Render the DataGrid component
  return (
    <div className="mt-5">
      <OperationDataGrid
        initialData={operations}
        isReportingOpen={reportingYear.is_reporting_open}
      />
    </div>
  );
}

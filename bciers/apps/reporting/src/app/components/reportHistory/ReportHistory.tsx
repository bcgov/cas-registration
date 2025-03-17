import { OperationRow, OperationsSearchParams } from "./types";
import ReportHistoryDataGrid from "@reporting/src/app/components/reportHistory/ReportHistoryDataGrid";
import { fetchReportHistoryPageData } from "@reporting/src/app/components/reportHistory/fetchReportHistoryPageData";

// 🧩 Main component
export default async function ReportHistory({
  searchParams,
}: {
  searchParams: OperationsSearchParams;
}) {
  // Fetch operations data
  const operations: {
    rows: OperationRow[];
    row_count: number;
  } = await fetchReportHistoryPageData(searchParams);
  if (!operations) {
    return <div>No operations data in database.</div>;
  }
  // Render the DataGrid component
  return (
    <div className="mt-5">
      <ReportHistoryDataGrid initialData={operations} />
    </div>
  );
}

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

  // Calculate if reporting is open by comparing current time with report_open_date in Pacific timezone
  const now = new Date();
  const reportOpenDate = new Date(reportingYear.report_open_date);

  const nowPST = new Date(
    now.toLocaleString("en-CA", { timeZone: "America/Vancouver" }),
  );
  const reportOpenDatePST = new Date(
    reportOpenDate.toLocaleString("en-CA", { timeZone: "America/Vancouver" }),
  );

  const isReportingOpen = nowPST > reportOpenDatePST;

  if (!operations) {
    return <div>No operations data in database.</div>;
  }
  // Render the DataGrid component
  return (
    <div className="mt-5">
      <OperationDataGrid
        initialData={operations}
        isReportingOpen={isReportingOpen}
      />
    </div>
  );
}

import { fetchReportHistoryPageData } from "@reporting/src/app/components/reportHistory/fetchReportHistoryPageData";
import ReportHistoryDataGrid from "@reporting/src/app/components/reportHistory/ReportHistoryDataGrid";
import { ReportHistorySearchParams } from "@reporting/src/app/components/reportHistory/types";

export default async function ReportHistoryPage({
  report_id,
  searchParams,
}: {
  report_id: number;
  searchParams: ReportHistorySearchParams;
}) {
  // Fetch history data with report_id and searchParams
  const { rowData, operationName, reportingYear } =
    await fetchReportHistoryPageData({
      report_id,
      searchParams,
    });
  return (
    <ReportHistoryDataGrid
      report_id={report_id}
      initialData={rowData}
      operationName={operationName}
      reportingYear={reportingYear}
    />
  );
}

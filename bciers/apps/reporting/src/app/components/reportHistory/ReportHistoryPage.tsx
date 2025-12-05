import { fetchReportHistoryPageData } from "@reporting/src/app/components/reportHistory/fetchReportHistoryPageData";
import React from "react";
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
  const response = await fetchReportHistoryPageData({
    report_id,
    searchParams,
  });
  const history = response.rowData;
  const operationName = response.operationName;
  const reportingYear = response.reportingYear;
  return (
    <ReportHistoryDataGrid
      report_id={report_id}
      initialData={history}
      operationName={operationName}
      reportingYear={reportingYear}
    />
  );
}

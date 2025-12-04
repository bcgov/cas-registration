import { getReportReportingYear } from "@reporting/src/app/utils/getReportReportingYear";
import { fetchReportHistoryPageData } from "@reporting/src/app/components/reportHistory/fetchReportHistoryPageData";
import { getOperationName } from "@reporting/src/app/utils/getOperationName";
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
  // Fetch operation name and reporting year only if report_id is valid
  const operationName = isNaN(report_id)
    ? ""
    : (await getOperationName(report_id)).name;
  const reportingYearObj = await getReportReportingYear(report_id);

  // Fetch history data with report_id and searchParams
  const response = await fetchReportHistoryPageData({
    report_id,
    searchParams,
  });
  const history = response.rowData;
  const reportingYear = response.reporting_year;
  return (
    <ReportHistoryDataGrid
      report_id={report_id}
      initialData={history}
      operationName={operationName}
      reportingYear={reportingYear}
    />
  );
}

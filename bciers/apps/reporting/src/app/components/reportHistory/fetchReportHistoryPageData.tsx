import { actionHandler } from "@bciers/actions";
import buildQueryParams from "@bciers/utils/src/buildQueryParams";
import { ReportHistorySearchParams } from "./types";

// 🛠️ Function to fetch operations
export const fetchReportHistoryPageData = async (params: {
  report_id: number;
  searchParams: ReportHistorySearchParams;
}) => {
  const queryParams = buildQueryParams(params.searchParams);
  const url = `reporting/v2/report/${params.report_id}/history${queryParams}`;
  const pageData = await actionHandler(url, "GET", url);
  return {
    rowData: {
      rows: pageData.payload.items,
      row_count: pageData.payload.count,
    },
    reportingYear: pageData.report_data.reporting_year,
    operationName: pageData.report_data.operation_name,
  };
};

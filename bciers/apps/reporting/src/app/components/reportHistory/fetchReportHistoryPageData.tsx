import { actionHandler } from "@bciers/actions";
import buildQueryParams from "@bciers/utils/src/buildQueryParams";
import { ReportHistorySearchParams } from "./types";

// 🛠️ Function to fetch operations
export const fetchReportHistoryPageData = async (params: {
  report_id: number;
  searchParams: ReportHistorySearchParams;
}) => {
  const queryParams = buildQueryParams(params.searchParams);
  const url = `reporting/v2/report/${params.report_id}/history${queryParams}page=1`;
  const pageData = await actionHandler(url, "GET", url);
  console.log("*********** pageData:", pageData);
  return {
    rowData: {
      rows: pageData.payload.items,
      row_count: pageData.payload.count,
    },
    reporting_year: pageData.report_data.reporting_year,
    operation_name: pageData.report_data.operation_name
  };
};

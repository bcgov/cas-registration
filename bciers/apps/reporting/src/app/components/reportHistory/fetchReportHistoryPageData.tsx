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
  console.log("************** Fetched report history page data:", pageData);
  return {
    rowData: {
      rows: pageData.payload.report_versions,
      row_count: pageData.payload.report_versions.length,
    },
    reporting_year: pageData.report_data.reporting_year,
  };
};

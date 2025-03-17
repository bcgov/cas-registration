import { actionHandler } from "@bciers/actions";
import buildQueryParams from "@bciers/utils/src/buildQueryParams";
import { OperationsSearchParams } from "./types";

// 🛠️ Function to fetch operations
export const fetchReportHistoryPageData = async (params: {
  report_id: number;
  searchParams: OperationsSearchParams;
}) => {
  const queryParams = buildQueryParams(params.searchParams);
  const url = `reporting/report-history/${params.report_id}${queryParams}`;
  const pageData = await actionHandler(url, "GET", url);
  return {
    rows: pageData.items,
    row_count: pageData.count,
  };
};

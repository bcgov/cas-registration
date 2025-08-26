import { actionHandler } from "@bciers/actions";
import buildQueryParams from "@bciers/utils/src/buildQueryParams";
import { ReportSearchParams } from "./types";

// 🛠️ Function to fetch annual reports
export const fetchAnnualReportsPageData = async (
  searchParams: ReportSearchParams,
) => {
  const queryParams = buildQueryParams({
    ...searchParams,
    get_past_reports: false,
  });
  // fetch data from server
  const pageData = await actionHandler(
    `reporting/reports${queryParams}`,
    "GET",
    "",
  );
  return {
    rows: pageData.items,
    row_count: pageData.count,
  };
};

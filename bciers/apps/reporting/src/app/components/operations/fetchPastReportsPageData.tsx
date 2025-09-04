import { actionHandler } from "@bciers/actions";
import buildQueryParams from "@bciers/utils/src/buildQueryParams";
import { ReportSearchParams } from "./types";

// 🛠️ Function to fetch past reports
export const fetchPastReportsPageData = async (
  searchParams: ReportSearchParams,
) => {
  const queryParams = buildQueryParams({
    ...searchParams,
    reports_period: "past",
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

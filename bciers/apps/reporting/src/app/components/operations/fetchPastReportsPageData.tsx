import { actionHandler } from "@bciers/actions";
import buildQueryParams from "@bciers/utils/src/buildQueryParams";
import { PastReportsSearchParams } from "./types";

// 🛠️ Function to fetch past reports
export const fetchPastReportsPageData = async (
  searchParams: PastReportsSearchParams,
) => {
  const queryParams = buildQueryParams(searchParams);
  // fetch data from server
  const pageData = await actionHandler(
    `reporting/past-operations${queryParams}`,
    "GET",
    "",
  );
  return {
    rows: pageData.items,
    row_count: pageData.count,
  };
};

import { actionHandler } from "@bciers/actions";
import buildQueryParams from "@bciers/utils/src/buildQueryParams";
import { OperationsSearchParams } from "./types";

// 🛠️ Function to fetch operations
export const fetchOperationsPageData = async (
  searchParams: OperationsSearchParams,
) => {
  const queryParams = buildQueryParams(searchParams);
  // fetch data from server
  const pageData = await actionHandler(
    `reporting/operations${queryParams}`,
    "GET",
    "",
  );
  return {
    rows: pageData.items,
    row_count: pageData.count,
  };
};

import buildQueryParams from "@bciers/utils/src/buildQueryParams";
import { OperationsSearchParams } from "@bciers/types/operations";
import { actionHandler } from "@bciers/actions";

// 🛠️ Function to fetch operations
export default async function fetchOperationsPageData(
  searchParams: OperationsSearchParams,
) {
  const queryParams = buildQueryParams(searchParams);
  // fetch data from server
  const pageData = await actionHandler(
    `registration/operations${queryParams}`,
    "GET",
    "",
  );
  return {
    rows: pageData.items,
    row_count: pageData.count,
  };
}

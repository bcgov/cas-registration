import buildQueryParams from "@bciers/utils/buildQueryParams";
import { OperationsSearchParams } from "./types";
import { actionHandler } from "@bciers/actions";

export default async function fetchOperationsPageData(
  searchParams: OperationsSearchParams,
) {
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
}

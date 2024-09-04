import buildQueryParams from "@bciers/utils/buildQueryParams";
import { OperationsSearchParams } from "./types";
import { actionHandler } from "@bciers/actions";

// 🛠️ Function to fetch operations
export default async function fetchOperationsPageData(
  searchParams: OperationsSearchParams,
) {
  try {
    const queryParams = buildQueryParams(searchParams);
    // fetch data from server
    const pageData = await actionHandler(
      `registration/v2/operations${queryParams}`,
      "GET",
      "",
    );
    return {
      rows: pageData.items,
      row_count: pageData.count,
    };
  } catch (error) {
    throw error;
  }
}

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
      rows: pageData.data,
      row_count: pageData.row_count,
    };
  } catch (error) {
    throw error;
  }
}

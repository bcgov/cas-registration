import buildQueryParams from "@bciers/utils/src/buildQueryParams";
import { OperatorsSearchParams } from "./types";
import { actionHandler } from "@bciers/actions";

// 🛠️ Function to fetch operators
export default async function fetchOperatorsPageData(
  searchParams: OperatorsSearchParams,
) {
  try {
    const queryParams = buildQueryParams(searchParams);
    // fetch data from server
    const pageData = await actionHandler(
      `registration/operators${queryParams}`,
      "GET",
      "",
    );
    return {
      rows: pageData?.items,
      row_count: pageData?.count,
    };
  } catch (error) {
    throw error;
  }
}

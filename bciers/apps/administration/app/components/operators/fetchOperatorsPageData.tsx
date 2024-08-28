import buildQueryParams from "@bciers/utils/buildQueryParams";
import { OperatorsSearchParams } from "./types";
import { actionHandler } from "@bciers/actions";

// 🛠️ Function to fetch operations
export default async function fetchOperatorsPageData(
  searchParams: OperatorsSearchParams,
) {
  try {
    const queryParams = buildQueryParams(searchParams);
    // fetch data from server
    const pageData = await actionHandler(
      `registration/v2/operators`,
      "GET",
      "",
    );
    console.log("page data: ", pageData);
    return {
      rows: pageData.data,
      row_count: pageData.row_count,
    };
  } catch (error) {
    throw error;
  }
}

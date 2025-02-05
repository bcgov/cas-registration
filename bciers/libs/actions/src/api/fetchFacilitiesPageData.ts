import buildQueryParams from "@bciers/utils/src/buildQueryParams";
import { OperationsSearchParams } from "@/administration/app/components/operations/types";
import { actionHandler } from "@bciers/actions";

// 🛠️ Function to fetch facilities
export default async function fetchOperationsPageData(
  searchParams: OperationsSearchParams,
) {
  try {
    const queryParams = buildQueryParams(searchParams);
    console.log("querrr", queryParams);
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
  } catch (error) {
    throw error;
  }
}

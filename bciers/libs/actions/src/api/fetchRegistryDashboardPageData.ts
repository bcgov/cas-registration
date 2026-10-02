import buildQueryParams from "@bciers/utils/src/buildQueryParams";
import { DashboardSearchParams } from "@/registry/app/components/dashboard/types";
import { actionHandler } from "@bciers/actions";

// 🛠️ Function to fetch operations
export default async function fetchRegistryDashboardPageData(
  searchParams: DashboardSearchParams,
) {
  const queryParams = buildQueryParams(searchParams);
  // fetch data from server
  const pageData = await actionHandler(
    `registry/${queryParams}`,
    "GET",
    "",
  );
  return {
    rows: pageData.items,
    row_count: pageData.count,
  };
}
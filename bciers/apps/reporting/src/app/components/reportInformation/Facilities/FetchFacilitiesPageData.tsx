import { actionHandler } from "@bciers/actions";
import buildQueryParams from "@bciers/utils/src/buildQueryParams";
import { FacilitiesSearchParams } from "@/administration/app/components/facilities/types";

// 🛠️ Function to fetch operations
export const fetchFacilitiesPageData = async (
  searchParams: FacilitiesSearchParams,
) => {
  const queryParams = buildQueryParams(searchParams);
  // fetch data from server
  console.log("querrr", queryParams);
  const pageData = await actionHandler(
    `reporting/report-version/2/facility-report-list`,
    "GET",
    "",
  );

  console.log("page data", pageData);
  return {
    rows: pageData.items,
    row_count: pageData.count,
  };
};

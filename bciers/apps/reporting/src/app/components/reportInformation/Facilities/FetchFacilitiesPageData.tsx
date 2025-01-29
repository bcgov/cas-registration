import { actionHandler } from "@bciers/actions";
import { FacilityReportSearchParams } from "@reporting/src/app/components/reportInformation/Facilities/types";
import buildQueryParams from "@bciers/utils/src/buildQueryParams";

// 🛠️ Function to fetch operations
export const fetchFacilitiesPageData = async (params: {
  version_id: number;
  searchParams: FacilityReportSearchParams;
}) => {
  const queryParams = buildQueryParams(params.searchParams);
  const url = `reporting/report-version/${params.version_id}/facility-report-list${queryParams}`;
  const pageData = await actionHandler(url, "GET", url);

  return {
    rows: pageData.items,
    row_count: pageData.count,
  };
};

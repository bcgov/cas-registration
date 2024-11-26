import buildQueryParams from "@bciers/utils/src/buildQueryParams";
import { actionHandler } from "@bciers/actions";
import { FacilitiesSearchParams } from "./types";

// ↓ fetch data from server
const fetchFacilitiesPageData = async (
  operationId: string,
  searchParams: FacilitiesSearchParams,
) => {
  try {
    const queryParams = buildQueryParams(searchParams);
    const pageData = await actionHandler(
      `registration/v2/operations/${operationId}/facilities${queryParams}`,
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
};

export default fetchFacilitiesPageData;

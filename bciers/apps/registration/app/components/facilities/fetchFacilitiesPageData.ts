import buildQueryParams from "@/app/utils/buildQueryParams";
import { actionHandler } from "@/app/utils/actions";
import { FacilitiesSearchParams } from "./types";

// ↓ fetch data from server
const fetchFacilitiesPageData = async (
  operationId: string,
  searchParams: FacilitiesSearchParams,
) => {
  try {
    const queryParams = buildQueryParams(searchParams);
    const pageData = await actionHandler(
      `registration/operations/${operationId}/facilities${queryParams}`,
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

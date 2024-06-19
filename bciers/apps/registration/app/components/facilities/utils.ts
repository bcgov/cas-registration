import buildQueryParams from "@/app/utils/buildQueryParams";
import { actionHandler } from "@/app/utils/actions";
import { FacilitiesSearchParams } from "./types";

// ↓ fetch data from server
export const fetchFacilitiesPageData = async (
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

// ⚡️ Higher-order function to create a data-fetching function with operationId
// This function is designed to generate a data-fetching function tailored to include a specific operationId.
// It is particularly useful in contexts where the operationId is a required parameter for data retrieval,
// such as in the DataGrid component which requires search parameters (searchParams) to fetch paginated data.
export const createFetchFacilitiesPageData = (operationId: string) => {
  return async (params: { [key: string]: any }) => {
    try {
      // Call the existing fetch function with the provided operationId and searchParams.
      // The searchParams are expected to be in the form of a key-value object.
      const pageData = await fetchFacilitiesPageData(operationId, params);

      // Return the fetched data in the required format.
      // The expected format includes an array of rows and a row count.
      return {
        rows: pageData.rows,
        row_count: pageData.row_count,
      };
    } catch (error) {
      // If an error occurs during the fetch, propagate the error to the caller.
      throw error;
    }
  };
};

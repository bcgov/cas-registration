import buildQueryParams from "@bciers/utils/src/buildQueryParams";
import { actionHandler } from "@bciers/actions";
import { TransfersSearchParams } from "./types";
import { GridRowsProp } from "@mui/x-data-grid";
import formatTimestamp from "@bciers/utils/src/formatTimestamp";

export const formatTransferRows = (rows: GridRowsProp) => {
  console.log("rows", rows);
  return rows.map(
    ({
      id,
      operation__name,
      facilities__name,
      status,
      effective_date,
      created_at,
    }) => {
      return {
        id,
        operation__name: operation__name || "N/A",
        facilities__name: facilities__name || "N/A",
        status,
        created_at: formatTimestamp(created_at),
        effective_date: formatTimestamp(effective_date),
      };
    },
  );
};
// 🛠️ Function to fetch transfers
export default async function fetchTransferEventsPageData(
  searchParams: TransfersSearchParams,
) {
  try {
    const queryParams = buildQueryParams(searchParams);
    // fetch data from server
    const pageData = await actionHandler(
      `registration/transfer-events${queryParams}`,
      "GET",
      "",
    );
    return {
      rows: formatTransferRows(pageData.items),
      row_count: pageData.count,
    };
  } catch (error) {
    throw error;
  }
}

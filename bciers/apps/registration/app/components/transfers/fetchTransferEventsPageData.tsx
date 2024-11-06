import buildQueryParams from "@bciers/utils/src/buildQueryParams";
import { actionHandler } from "@bciers/actions";
import { TransfersSearchParams } from "./types";
import { GridRowsProp } from "@mui/x-data-grid";
import formatTimestamp from "@bciers/utils/src/formatTimestamp";

export const formatTransferRows = (rows: GridRowsProp) => {
  return rows.map(
    ({
      id,
      operation,
      facilities,
      status,
      effective_date,
      submission_date,
    }) => {
      return {
        id,
        operation,
        facilities: facilities ?? "N/A",
        status,
        submission_date: formatTimestamp(submission_date),
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

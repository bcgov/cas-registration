import buildQueryParams from "@bciers/utils/src/buildQueryParams";
import { actionHandler } from "@bciers/actions";
import { TransfersSearchParams } from "./types";
import { GridRowsProp } from "@mui/x-data-grid";
import formatTimestamp from "@bciers/utils/src/formatTimestamp";

export const formatTransferRows = (rows: GridRowsProp) => {
  const operationRows = rows
    .filter((row) => row.operation)
    .map(({ id, operation, status, effective_date, created_at }) => {
      return {
        id,
        operation: operation,
        facility: "N/A",
        status,
        submission_date: formatTimestamp(created_at),
        effective_date: formatTimestamp(effective_date),
      };
    });
  const facilityRows = rows
    .filter((row) => row.facilities)
    .flatMap(({ id, facilities, status, effective_date, created_at }) => {
      return (facilities || []).map((facility) => {
        console.log("facility", facility);
        return {
          id,
          operation: "N/A",
          facility: facility.name, // Use individual facility here
          status,
          submission_date: formatTimestamp(created_at),
          effective_date: formatTimestamp(effective_date),
        };
      });
    });
  return [...operationRows, ...facilityRows];
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
    const formattedRows = formatTransferRows(pageData.items);
    // brianna why is frontend showing Facility 2 twice? initial data is ok
    return {
      rows: formattedRows,
      row_count: formattedRows.length,
    };
  } catch (error) {
    throw error;
  }
}

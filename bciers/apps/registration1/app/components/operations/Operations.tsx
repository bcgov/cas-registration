import { GridRowsProp } from "@mui/x-data-grid";

import { actionHandler } from "@bciers/actions";
import { auth } from "@/dashboard/auth";
import {
  OperationRow,
  OperationsSearchParams,
} from "@/app/components/operations/types";
import buildQueryParams from "@bciers/utils/src/buildQueryParams";
import OperationDataGrid from "./OperationDataGrid";

const formatTimestamp = (timestamp: string) => {
  if (!timestamp) return undefined;

  const date = new Date(timestamp).toLocaleString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Vancouver",
  });

  const timeWithTimeZone = new Date(timestamp).toLocaleString("en-CA", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZoneName: "short",
    timeZone: "America/Vancouver",
  });

  // Return with a line break so we can display date and time on separate lines
  // in the DataGrid cell using whiteSpace: "pre-line" CSS
  return `${date}\n${timeWithTimeZone}`;
};
export const formatOperationRows = (rows: GridRowsProp) => {
  return rows.map(
    ({
      id,
      bc_obps_regulated_operation,
      operator,
      submission_date,
      status,
      name,
      bcghg_id,
    }) => {
      return {
        id,
        bc_obps_regulated_operation: bc_obps_regulated_operation ?? "N/A",
        name,
        bcghg_id,
        operator: operator,
        submission_date: formatTimestamp(submission_date) ?? status,
        status,
      };
    },
  );
};

// 🛠️ Function to fetch operations
export const fetchOperationsPageData = async (
  searchParams: OperationsSearchParams,
) => {
  try {
    const queryParams = buildQueryParams(searchParams);

    // fetch data from server
    const pageData = await actionHandler(
      `registration/v1/operations${queryParams}`,
      "GET",
      "",
    );
    return {
      rows: formatOperationRows(pageData.data),
      row_count: pageData.row_count,
    };
  } catch (error) {
    throw error;
  }
};

// 🧩 Main component
export default async function Operations({
  searchParams,
}: {
  searchParams: OperationsSearchParams;
}) {
  const session = await auth();
  // Fetch operations data
  const operations: {
    rows: OperationRow[];
    row_count: number;
  } = await fetchOperationsPageData(searchParams);
  if (!operations) {
    return <div>No operations data in database.</div>;
  }

  // Show the operator column if the user is CAS internal
  const isOperatorColumn =
    session?.user?.app_role?.includes("cas") &&
    !session?.user?.app_role?.includes("pending");

  // Render the DataGrid component
  return (
    <div className="mt-5">
      <OperationDataGrid
        initialData={operations}
        isOperatorColumn={isOperatorColumn}
      />
    </div>
  );
}

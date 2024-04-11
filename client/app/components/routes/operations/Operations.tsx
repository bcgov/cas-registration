import { GridRowsProp } from "@mui/x-data-grid";

import { actionHandler } from "@/app/utils/actions";
import OperationDataGrid from "@/app/components/datagrid/OperationDataGrid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// 🛠️ Function to fetch operations
async function getOperations() {
  try {
    return await actionHandler(
      // Fetch page one of the operations data on initial load
      "registration/operations",
      "GET",
      "/dashboard/operations",
    );
  } catch (error) {
    // Handle the error here or rethrow it to handle it at a higher level
    throw error;
  }
}
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

// 🧩 Main component
export default async function Operations() {
  const session = await getServerSession(authOptions);
  // Fetch operations data
  const operations: {
    data: {
      id: number;
      bcghg_id: string;
      bc_obps_regulated_operation: string;
      name: string;
      operator: string;
      submission_date: string;
      status: string;
    }[];
    row_count: number;
  } = await getOperations();
  if (!operations) {
    return <div>No operations data in database.</div>;
  }

  const { row_count: rowCount } = operations;
  // Transform the fetched data into rows for the DataGrid component

  const rows = formatOperationRows(operations.data);
  // Show the operator column if the user is CAS internal
  const isOperatorColumn =
    session?.user.app_role?.includes("cas") &&
    !session?.user.app_role?.includes("pending");

  // Render the DataGrid component
  return (
    <div className="mt-5">
      <OperationDataGrid
        rows={rows}
        rowCount={rowCount}
        isOperatorColumn={isOperatorColumn}
      />
    </div>
  );
}

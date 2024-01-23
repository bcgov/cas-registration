import { GridRowsProp } from "@mui/x-data-grid";

import { actionHandler } from "@/app/utils/actions";
import DataGrid from "@/app/components/datagrid/DataGrid";
import { statusStyle } from "@/app/components/datagrid/helpers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// 🛠️ Function to fetch operations
async function getOperations() {
  try {
    return await actionHandler(
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
  });

  const timeWithTimeZone = new Date(timestamp).toLocaleString("en-CA", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZoneName: "short",
  });

  // Return with a line break so we can display date and time on separate lines
  // in the DataGrid cell using whiteSpace: "pre-line" CSS
  return `${date}\n${timeWithTimeZone}`;
};

// 🧩 Main component
export default async function Operations() {
  const session = await getServerSession(authOptions);
  // Fetch operations data
  const operations: {
    id: number;
    bcghg_id: string;
    bc_obps_regulated_operation: string;
    name: string;
    operator: string;
    submission_date: string;
    status: string;
  }[] = await getOperations();
  if (!operations) {
    return <div>No operations data in database.</div>;
  }
  // Transform the fetched data into rows for the DataGrid component
  const rows: GridRowsProp =
    operations.length > 0
      ? operations.map(
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
              operation_name: name,
              bcghg_id: bcghg_id,
              operator_name: operator,
              submission_date: formatTimestamp(submission_date) ?? status,
              status: status,
            };
          },
        )
      : [];

  // Show the operator column if the user is CAS internal
  const isOperatorColumn =
    session?.user.app_role?.includes("cas") &&
    !session?.user.app_role?.includes("pending");

  const columns = [
    { field: "bcghg_id", headerName: "BC GHG ID", width: 160 },
    {
      field: "operation_name",
      headerName: "Operation",
      width: isOperatorColumn ? 320 : 560,
    },
    {
      field: "submission_date",
      headerName: "Submission Date",
      width: isOperatorColumn ? 200 : 220,
    },
    {
      field: "bc_obps_regulated_operation",
      headerName: "BORO ID",
      width: isOperatorColumn ? 160 : 220,
    },
    {
      field: "status",
      headerName: "Application Status",
      width: 130,
      renderCell: statusStyle,
    },
    {
      field: "action",
      headerName: "Action",
      sortable: false,
      width: 120,
      // Set flex to 1 to make the column take up all the remaining width if user zooms out
      flex: 1,
    },
  ];

  const operatorColumnIndex = 1;

  if (isOperatorColumn) {
    // Add the operator column if the user is CAS internal
    columns.splice(operatorColumnIndex, 0, {
      field: "operator_name",
      headerName: "Operator",
      width: 320,
    });
  }

  // Render the DataGrid component
  return (
    <div className="mt-5">
      <DataGrid cntxt="operations" rows={rows} columns={columns} />
    </div>
  );
}

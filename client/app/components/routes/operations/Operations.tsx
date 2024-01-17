import { GridRowsProp } from "@mui/x-data-grid";

import { actionHandler } from "@/app/utils/actions";
import DataGrid from "@/app/components/datagrid/DataGrid";
import { lineBreakStyle, statusStyle } from "@/app/components/datagrid/helpers";

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
  // Fetch operations data
  const operations: {
    id: number;
    bc_obps_regulated_operation: string;
    name: string;
    operator: string;
    submission_date: string;
    status: string;
  }[] = await getOperations();

  if (!operations) {
    return (
      <div>
        No operations data in database (did you forget to run `make
        loadfixtures`?)
      </div>
    );
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
          }) => {
            return {
              id,
              bc_obps_regulated_operation,
              operation_name: name,
              operation_id: id,
              operator_name: operator,
              submission_date: formatTimestamp(submission_date),
              status: status,
            };
          },
        )
      : [];
  // Render the DataGrid component
  return (
    <div className="mt-5">
      <DataGrid
        cntxt="operations"
        rows={rows}
        columns={[
          { field: "operation_id", headerName: "Operation ID", width: 160 },
          { field: "operator_name", headerName: "Operator", width: 320 },
          { field: "operation_name", headerName: "Operation", width: 320 },
          {
            field: "submission_date",
            headerName: "Submission\n Date",
            width: 200,
            renderCell: lineBreakStyle,
          },
          {
            field: "bc_obps_regulated_operation",
            headerName: "BORO\n ID",
            width: 170,
          },
          {
            field: "status",
            headerName: "Status",
            width: 120,
            renderCell: statusStyle,
          },
          {
            field: "action",
            headerName: "Action",
            sortable: false,
            width: 120,
          },
        ]}
      />
    </div>
  );
}

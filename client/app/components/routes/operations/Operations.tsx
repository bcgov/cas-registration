import { GridRowsProp } from "@mui/x-data-grid";

import { actionHandler } from "@/app/utils/actions";
import DataGrid from "@/app/components/datagrid/DataGrid";
import { statusStyle } from "@/app/components/datagrid/helpers";

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

// 🧩 Main component
export default async function Operations() {
  // Fetch operations data
  const operations: {
    id: number;
    bc_obps_regulated_operation: string;
    name: string;
    operator: string;
    submission_date: string;
    registration_id: string;
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
            registration_id,
            status,
            name,
          }) => {
            return {
              id,
              bc_obps_regulated_operation,
              operation_name: name,
              operation_id: id,
              operator_name: operator,
              submission_date,
              registration_id,
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
          { field: "operation_id", headerName: "Operation ID", width: 120 },
          { field: "operator_name", headerName: "Operator", width: 280 },
          { field: "operation_name", headerName: "Operation", width: 280 },
          {
            field: "submission_date",
            headerName: "Submission\n Date",
            width: 150,
          },
          {
            field: "registration_id",
            headerName: "Registration\n ID",
            width: 130,
          },
          {
            field: "bc_obps_regulated_operation",
            headerName: "BORO\n ID",
            width: 120,
          },
          {
            field: "status",
            headerName: "Status",
            width: 180,
            renderCell: statusStyle,
          },
          {
            field: "action",
            headerName: "Action",
            sortable: false,
            width: 150,
          },
        ]}
      />
    </div>
  );
}

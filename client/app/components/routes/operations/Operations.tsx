import { GridRowsProp } from "@mui/x-data-grid";

import { actionHandler } from "@/app/utils/actions";
import DataGrid from "@/app/components/datagrid/DataGrid";

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
    registration_year: string;
    submission_date: string;
    registration_id: string;
    status: string;
    name: string;
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
            registration_year,
            submission_date,
            registration_id,
            status,
            name,
          }) => {
            return {
              id,
              bc_obps_regulated_operation,
              name,
              operation_id: id,
              registration_year,
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
          { field: "operation_id", headerName: "Operation\n ID", width: 150 },
          { field: "name", headerName: "Operation", width: 150 },
          {
            field: "registration_year",
            headerName: "Registration\n Year",
            width: 150,
          },
          {
            field: "submission_date",
            headerName: "Submission\n Date",
            width: 150,
          },
          {
            field: "registration_id",
            headerName: "Registration\n ID",
            width: 150,
          },
          {
            field: "bc_obps_regulated_operation",
            headerName: "BORO\n ID",
            width: 150,
          },
          { field: "status", headerName: "Status", width: 180 },
          {
            field: "action",
            headerName: "Action",
            sortable: false,
            // Temporary width, will be reduced in follow up PR #468 operations table
            width: 350,
          },
        ]}
      />
    </div>
  );
}

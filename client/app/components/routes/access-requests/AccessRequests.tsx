import { GridRowsProp } from "@mui/x-data-grid";
import Note from "@/app/components/datagrid/Note";

import { actionHandler } from "@/app/utils/actions";
import DataGrid from "@/app/components/datagrid/DataGrid";
import { UserOperator } from "./types";
import { statusStyle } from "@/app/components/datagrid/helpers";

// 🛠️ Function to fetch user-operators
async function getUserOperators() {
  try {
    return await actionHandler(
      "registration/user-operators",
      "GET",
      "/dashboard/operators",
    );
  } catch (error) {
    // Handle the error here or rethrow it to handle it at a higher level
    throw error;
  }
}

function capitalizeString(value: string): string {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}

// 🧩 Main component
export default async function AccessRequests() {
  // Fetch userOperator data
  const userOperators: [UserOperator] = await getUserOperators();
  if (!userOperators) {
    return <div>No access requests yet.</div>;
  }

  // Transform the fetched data into rows for the DataGrid component
  const rows: GridRowsProp =
    userOperators.length > 0
      ? userOperators.map(
          ({ id, status, first_name, last_name, email, legal_name }) => {
            return {
              id,
              status: capitalizeString(status),
              first_name,
              last_name,
              email,
              legal_name,
            };
          },
        )
      : [];

  // Render the DataGrid component
  return (
    <>
      <Note
        classNames="mb-4 mt-6"
        message="Once “Approved”, the user will have access to their
      operator dashboard with full admin permissions, and can grant access and
      designate permissions to other Business BCeID holders there."
      />
      <DataGrid
        cntxt="user-operators"
        rows={rows}
        columns={[
          {
            field: "id",
            headerName: "Request\n ID",
            width: 100,
            headerClassName: "table-heading",
          },
          { field: "first_name", headerName: "First\n Name", width: 180 },
          { field: "last_name", headerName: "Last\n Name", width: 180 },
          { field: "email", headerName: "Email", width: 300 },
          { field: "legal_name", headerName: "Operator", width: 380 },
          {
            field: "status",
            headerName: "Status",
            width: 130,
            renderCell: statusStyle,
          },
          {
            field: "action",
            headerName: "Action",
            sortable: false,
            width: 140,
          },
        ]}
      />
    </>
  );
}

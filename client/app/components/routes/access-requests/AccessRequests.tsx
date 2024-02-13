import { GridRowsProp } from "@mui/x-data-grid";
import Note from "@/app/components/datagrid/Note";

import { actionHandler } from "@/app/utils/actions";
import OperatorDataGrid from "@/app/components/datagrid/OperatorDataGrid";
import { UserOperatorPaginated } from "./types";
import { statusStyle } from "@/app/components/datagrid/helpers";

// 🛠️ Function to fetch user-operators
async function getUserOperators() {
  try {
    return await actionHandler(
      "registration/user-operators?page=1",
      "GET",
      "/dashboard/operators",
    );
  } catch (error) {
    // Handle the error here or rethrow it to handle it at a higher level
    throw error;
  }
}

export const formatUserOperatorRows = (rows: GridRowsProp) => {
  return rows.map(
    ({ id, status, first_name, last_name, email, legal_name }) => {
      return {
        id,
        status,
        first_name,
        last_name,
        email,
        legal_name,
      };
    },
  );
};

// 🧩 Main component
export default async function AccessRequests() {
  // Fetch userOperator data
  const userOperators: UserOperatorPaginated = await getUserOperators();
  if (!userOperators) {
    return <div>No access requests yet.</div>;
  }
  const { row_count: rowCount } = userOperators;
  const rows = formatUserOperatorRows(userOperators.data);

  // Render the DataGrid component
  return (
    <>
      <Note
        classNames="mb-4 mt-6"
        message="Once “Approved,” the user will have access to their operator dashboard with full admin permissions, and can grant access and designate permissions to other authorized users there."
      />
      <OperatorDataGrid
        rows={rows}
        rowCount={rowCount}
        columns={[
          {
            field: "id",
            headerName: "Request\n ID",
            width: 100,
          },
          { field: "first_name", headerName: "First\n Name", width: 180 },
          { field: "last_name", headerName: "Last\n Name", width: 180 },
          { field: "email", headerName: "Email", width: 300 },
          {
            field: "legal_name",
            headerName: "Operator",
            width: 380,
          },

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
            // Set flex to 1 to make the column take up all the remaining width if user zooms out
            flex: 1,
          },
        ]}
      />
    </>
  );
}

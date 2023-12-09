import { GridRowsProp } from "@mui/x-data-grid";

import { actionHandler } from "@/app/utils/actions";
import DataGrid from "@/app/components/datagrid/DataGrid";

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
  const userOperators: any = await getUserOperators();
  if (!userOperators) {
    return (
      <div>
        No user-operators data in database (did you forget to run `make
        loadfixtures`?)
      </div>
    );
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
      <DataGrid
        cntxt="user-operators"
        rows={rows}
        columns={[
          { field: "id", headerName: "Request ID", width: 150 },
          { field: "first_name", headerName: "First Name", width: 150 },
          { field: "last_name", headerName: "Last Name", width: 150 },
          { field: "email", headerName: "Email", width: 300 },
          { field: "legal_name", headerName: "Operator", width: 300 },
          { field: "status", headerName: "Status", width: 150 },
          {
            field: "action",
            headerName: "Action",
            sortable: false,
            width: 200,
          },
        ]}
      />
    </>
  );
}

import { GridRowsProp } from "@mui/x-data-grid";
import Note from "@/app/components/datagrid/Note";
import OperatorDataGrid from "@/app/components/datagrid/OperatorDataGrid";
import { UserOperatorPaginated } from "./types";
import { statusStyle } from "@/app/components/datagrid/helpers";

export const formatUserOperatorRows = (rows: GridRowsProp) => {
  return rows?.map(
    ({
      id,
      user_friendly_id,
      status,
      first_name,
      last_name,
      email,
      legal_name,
      bceid_business_name,
    }) => {
      return {
        id, // This unique ID is needed for DataGrid to work properly
        user_friendly_id,
        status,
        first_name,
        last_name,
        email,
        legal_name,
        bceid_business_name,
      };
    },
  );
};

// 🧩 Main component
const AccessRequests = ({
  userOperators,
}: {
  userOperators: UserOperatorPaginated;
}) => {
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
            field: "user_friendly_id",
            headerName: "Request\n ID",
            width: 100,
          },
          { field: "first_name", headerName: "First\n Name", width: 150 },
          { field: "last_name", headerName: "Last\n Name", width: 150 },
          { field: "email", headerName: "Email", width: 200 },

          {
            field: "bceid_business_name",
            headerName: "BCeID Business Name",
            width: 280,
          },
          {
            field: "legal_name",
            headerName: "Operator Legal Name",
            width: 280,
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
};

export default AccessRequests;

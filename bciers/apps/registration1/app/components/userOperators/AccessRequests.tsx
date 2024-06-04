import Note from "@bciers/components/datagrid/Note";
import { UserOperatorPaginated } from "./types";
import StatusStyleColumnCell from "@bciers/components/datagrid/cells/StatusStyleColumnCell";
import OperatorDataGrid from "./OperatorDataGrid";

// 🧩 Main component
const AccessRequests = ({
  initialData,
}: {
  initialData: UserOperatorPaginated;
}) => {
  if (!initialData) {
    return <div>No access requests yet.</div>;
  }

  // Render the DataGrid component
  return (
    <>
      <Note
        classNames="mb-4 mt-6"
        message="Once “Approved,” the user will have access to their operator dashboard with full admin permissions, and can grant access and designate permissions to other authorized users there."
      />
      <OperatorDataGrid
        initialData={initialData}
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
            renderCell: StatusStyleColumnCell,
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

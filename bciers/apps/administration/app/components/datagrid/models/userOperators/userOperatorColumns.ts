import { GridColDef } from "@mui/x-data-grid";
import StatusStyleColumnCell from "@bciers/components/datagrid/cells/StatusStyleColumnCell";
import UserRoleColumnCell from "@/administration/app/components/userOperators/cells/UserRoleColumnCell";
import ActionColumnCell from "@/administration/app/components/userOperators/cells/ActionColumnCell";

const userOperatorColumns = () => {
  const columns: GridColDef[] = [
    {
      field: "userFriendlyId",
      headerName: "User ID",
      align: "center",
      headerAlign: "center",
      flex: 1,
    },
    {
      field: "name",
      headerName: "Name",
      align: "center",
      headerAlign: "center",
      width: 220,
    },
    {
      field: "email",
      headerName: "Email",
      align: "center",
      headerAlign: "center",
      width: 210,
    },
    {
      field: "business",
      headerName: "BCeID Business",
      align: "center",
      headerAlign: "center",
      minWidth: 220,
      flex: 1,
    },
    {
      field: "userRole",
      headerName: "User Role",
      renderCell: UserRoleColumnCell,
      align: "center",
      headerAlign: "center",
      width: 140,
    },
    {
      field: "status",
      headerName: "Status",
      renderCell: StatusStyleColumnCell,
      align: "center",
      headerAlign: "center",
      width: 140,
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      renderCell: ActionColumnCell,
      align: "center",
      headerAlign: "center",
      width: 260,
    },
  ];

  return columns;
};

export default userOperatorColumns;

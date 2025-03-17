import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import UserOperatorRoleCell from "@/administration/app/components/userOperators/cells/UserOperatorRoleCell";

const userOperatorColumns = (
  ActionCell: (params: GridRenderCellParams) => JSX.Element,
) => {
  const columns: GridColDef[] = [
    {
      field: "user_friendly_id",
      headerName: "Request ID",
      align: "center",
      headerAlign: "center",
      width: 120,
    },
    {
      field: "user__first_name",
      headerName: "First Name",
      align: "center",
      headerAlign: "center",
      width: 150,
    },
    {
      field: "user__last_name",
      headerName: "Last Name",
      align: "center",
      headerAlign: "center",
      width: 150,
    },
    {
      field: "user__email",
      headerName: "Email",
      align: "center",
      headerAlign: "center",
      width: 200,
    },
    {
      field: "user__bceid_business_name",
      headerName: "BCeID Business Name",
      align: "center",
      headerAlign: "center",
      minWidth: 200,
      flex: 1,
    },
    {
      field: "operator__legal_name",
      headerName: "Operator",
      align: "center",
      headerAlign: "center",
      minWidth: 200,
      flex: 1,
    },
    {
      field: "role",
      headerName: "Role",
      renderCell: UserOperatorRoleCell,
      align: "center",
      headerAlign: "center",
      width: 150,
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      renderCell: ActionCell,
      align: "center",
      headerAlign: "center",
      minWidth: 220,
      flex: 1,
    },
  ];

  return columns;
};

export default userOperatorColumns;

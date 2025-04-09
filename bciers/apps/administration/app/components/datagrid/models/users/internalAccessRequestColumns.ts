import { GridColDef } from "@mui/x-data-grid";
import InternalUserRoleColumnCell from "@/administration/app/components/users/cells/InternalUserRoleColumnCell";
import InternalUserStatusColumnCell from "@/administration/app/components/users/cells/InternalUserStatusColumnCell";
import ActionColumnCell from "@/administration/app/components/users/cells/ActionColumnCell";
import { FrontEndRoles } from "@bciers/utils/src/enums";

const accessRequestColumns = (currentUserRole: FrontEndRoles) => {
  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      align: "center",
      headerAlign: "center",
      width: 220,
      flex: 1,
    },
    {
      field: "email",
      headerName: "Email",
      align: "center",
      headerAlign: "center",
      width: 210,
    },
    {
      field: "role",
      headerName: "User Role",
      renderCell: InternalUserRoleColumnCell,
      align: "center",
      headerAlign: "center",
      width: 140,
    },
    {
      field: "status",
      headerName: "Status",
      renderCell: InternalUserStatusColumnCell,
      align: "center",
      headerAlign: "center",
      width: 140,
    },
  ];

  if (currentUserRole === FrontEndRoles.CAS_ADMIN) {
    // Add action column (contains buttons to edit user roles)           only if user is cas_admin
    columns.push({
      field: "actions",
      headerName: "Approve Access?",
      sortable: false,
      renderCell: ActionColumnCell,
      align: "center",
      headerAlign: "center",
      width: 260,
    });
  }

  return columns;
};

export default accessRequestColumns;

import { GridColDef, GridRowsProp } from "@mui/x-data-grid";
import DataGrid from "@/app/components/datagrid/DataGrid";
import {
  ExternalDashboardUsersTile,
  processExternalDashboardUsersTileData,
} from "@/app/utils/users/adminUserOperators";
import { ChangeUserOperatorStatusColumnCell } from "@/app/components/datagrid/ChangeUserOperatorStatusColumnCell";
import { statusStyle } from "@/app/components/datagrid/helpers";

export default async function Page() {
  const userOperatorStatuses: ExternalDashboardUsersTile[] =
    await processExternalDashboardUsersTileData();
  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "User ID",
      flex: 2,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "name",
      headerName: "Name",
      flex: 2,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "email",
      headerName: "Email",
      flex: 6,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "business",
      headerName: "BCeID Business",
      flex: 6,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "userRole",
      headerName: "User Role",
      flex: 4,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "status",
      headerName: "Status",
      flex: 3,
      renderCell: statusStyle,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      renderCell: ChangeUserOperatorStatusColumnCell,
      flex: 6,
      align: "center",
      headerAlign: "center",
    },
  ];
  const statusRows: GridRowsProp = userOperatorStatuses.map((uOS) => ({
    id: uOS.user.user_guid,
    name: `${uOS.user.first_name} ${uOS.user.last_name.slice(0, 1)}`,
    email: uOS.user.email,
    business: uOS.operator.legal_name,
    userRole: uOS.role,
    status: uOS.status,
  }));

  return (
    <>
      <DataGrid rows={statusRows} columns={columns} />
    </>
  );
}

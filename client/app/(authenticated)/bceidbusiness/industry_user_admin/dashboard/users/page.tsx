import { Suspense } from "react";

import { GridColDef } from "@mui/x-data-grid";
import UserOperatorDataGrid from "@/app/components/datagrid/UserOperatorDataGrid";
import Loading from "@/app/components/loading/SkeletonGrid";
import {
  ExternalDashboardUsersTile,
  processExternalDashboardUsersTileData,
} from "@/app/utils/users/adminUserOperators";
import ChangeUserOperatorStatusColumnCell from "@/app/components/datagrid/cells/ChangeUserOperatorStatusColumnCell";
import { statusStyle } from "@/app/components/datagrid/helpers";

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
    field: "accessType",
    headerName: "Access Type",
    flex: 4,
    align: "center",
    headerAlign: "center",
    editable: true,
    type: "singleSelect",
    valueOptions: [
      { value: "admin", label: "Admin" },
      { value: "reporter", label: "Reporter" },
    ],
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

const UserOperatorsPage = async () => {
  const userOperatorStatuses: ExternalDashboardUsersTile[] =
    await processExternalDashboardUsersTileData();

  const statusRows = userOperatorStatuses.map((uOS) => ({
    id: uOS.id, // This unique ID is needed for DataGrid to work properly
    name: `${uOS.user.first_name} ${uOS.user.last_name}`,
    email: uOS.user.email,
    business: uOS.operator.legal_name,
    accessType: uOS.role,
    status: uOS.status,
    userOperatorId: uOS.id,
  }));

  return (
    <Suspense fallback={<Loading />}>
      <UserOperatorDataGrid columns={columns} rows={statusRows} />
    </Suspense>
  );
};

export default UserOperatorsPage;

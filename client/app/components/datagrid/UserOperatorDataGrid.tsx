"use client";

import { GridColDef } from "@mui/x-data-grid";
import DataGrid from "@/app/components/datagrid/DataGrid";
import { OperatorStatus } from "@/app/utils/enums";
import AccessTypeColumnCell from "@/app/components/datagrid/cells/AccessTypeColumnCell";
import ChangeUserOperatorStatusColumnCell from "@/app/components/datagrid/cells/ChangeUserOperatorStatusColumnCell";
import { statusStyle } from "@/app/components/datagrid/helpers";

const columns: GridColDef[] = [
  {
    field: "id",
    headerName: "User ID",
    align: "center",
    headerAlign: "center",
    width: 120,
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
    field: "accessType",
    headerName: "Access Type",
    renderCell: AccessTypeColumnCell,
    align: "center",
    headerAlign: "center",
    width: 140,
  },
  {
    field: "status",
    headerName: "Status",
    renderCell: statusStyle,
    align: "center",
    headerAlign: "center",
    width: 140,
  },
  {
    field: "actions",
    headerName: "Actions",
    sortable: false,
    renderCell: ChangeUserOperatorStatusColumnCell,
    align: "center",
    headerAlign: "center",
    width: 260,
  },
];

const UserOperatorDataGrid = ({
  userOperatorData,
}: {
  userOperatorData: any[];
}) => {
  const rowData = userOperatorData.map((uOS) => {
    const { id, role, status, user, operator } = uOS;

    return {
      id: id, // This unique ID is needed for DataGrid to work properly
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      business: operator.legal_name,
      accessType: status === OperatorStatus.DECLINED ? "N/A" : role,
      status: status,
      userOperatorId: id,
    };
  });

  return <DataGrid rows={rowData} columns={columns} />;
};

export default UserOperatorDataGrid;

"use client";

import { GridColDef } from "@mui/x-data-grid";
import DataGrid from "@/app/components/datagrid/DataGrid";
import { OperatorStatus } from "@/app/utils/enums";
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

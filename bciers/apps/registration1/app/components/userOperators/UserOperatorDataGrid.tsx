"use client";

import { GridColDef } from "@mui/x-data-grid";
import DataGrid from "apps/registration1/app/components/datagrid/DataGrid";
import AccessTypeColumnCell from "@bciers/components/datagrid/cells/AccessTypeColumnCell";
import StatusStyleColumnCell from "@bciers/components/datagrid/cells/StatusStyleColumnCell";
import { UserOperatorDataGridRow } from "apps/registration1/app/utils/users/adminUserOperators";
import ChangeUserOperatorStatusColumnCell from "../datagrid/cells/ChangeUserOperatorStatusColumnCell";

const columns: GridColDef[] = [
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
    renderCell: StatusStyleColumnCell,
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
  initialData,
}: {
  initialData: {
    rows: UserOperatorDataGridRow[];
  };
}) => {
  return <DataGrid initialData={initialData} columns={columns} />;
};

export default UserOperatorDataGrid;

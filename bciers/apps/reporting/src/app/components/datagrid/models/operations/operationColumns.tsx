"use client";
import { GridColDef } from "@mui/x-data-grid";
import StatusCell from "@reporting/src/app/components/operations/cells/StatusCell";
import ActionCell from "@reporting/src/app/components/operations/cells/ActionCell";
import MoreActionsCell from "@reporting/src/app/components/operations/cells/MoreActionsCell";

export const OPERATOR_COLUMN_INDEX = 1;

const operationColumns = (): GridColDef[] => {
  const columns: GridColDef[] = [
    { field: "bcghg_id", headerName: "BC GHG ID", width: 160 },
    {
      field: "name",
      headerName: "Operation",
      width: 560,
    },
    {
      field: "report_status",
      headerName: "Status",
      renderCell: StatusCell,
      align: "center",
      headerAlign: "center",
      width: 200,
    },
    {
      field: "report_id",
      headerName: "Actions",
      renderCell: ActionCell,
      sortable: false,
      width: 200,
    },

    {
      field: "more",
      headerName: "More Actions",
      renderCell: MoreActionsCell,
      sortable: false,
      width: 120,
      flex: 1,
    },
  ];

  return columns;
};

export default operationColumns;

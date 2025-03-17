"use client";
import { GridColDef } from "@mui/x-data-grid";
import ReportingOperationStatusCell from "@reporting/src/app/components/operations/cells/ReportingOperationStatusCell";
import ActionCell from "@reporting/src/app/components/operations/cells/ActionCell";
import MoreCell from "@reporting/src/app/components/operations/cells/MoreActions";

export const OPERATOR_COLUMN_INDEX = 1;

const reportHistoryColumns = (): GridColDef[] => {
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
      renderCell: ReportingOperationStatusCell,
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
      renderCell: MoreCell,
      sortable: false,
      width: 120,
      flex: 1,
    },
  ];

  return columns;
};

export default reportHistoryColumns;

"use client";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import StatusCell from "@reporting/src/app/components/operations/cells/StatusCell";
import ActionCell from "@reporting/src/app/components/operations/cells/ActionCell";
import MoreActionsCell from "@reporting/src/app/components/operations/cells/MoreActionsCell";
import { ReportOperationStatus } from "@bciers/utils/src/enums";
import formatTimestamp from "@bciers/utils/src/formatTimestamp";

export const OPERATOR_COLUMN_INDEX = 1;
const UpdatedAtCell = ({ row, value }: GridRenderCellParams) =>
  row.report_status && row.report_status !== ReportOperationStatus.DRAFT
    ? value
      ? formatTimestamp(value)
      : ""
    : "";

const SubmittedByCell = ({ row }: GridRenderCellParams) =>
  row.report_status && row.report_status !== ReportOperationStatus.DRAFT
    ? row.submitted_by
    : "";

const operationColumns = (): GridColDef[] => {
  const columns: GridColDef[] = [
    { field: "bcghg_id", headerName: "BC GHG ID", width: 160 },
    {
      field: "name",
      headerName: "Operation",
      width: 300,
    },
    {
      field: "report_updated_at",
      headerName: "Date of submission",
      renderCell: UpdatedAtCell,
      width: 200,
    },
    {
      field: "report_submitted_by",
      headerName: "Submitted by",
      renderCell: SubmittedByCell,
      width: 200,
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

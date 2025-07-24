"use client";

import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import MoreActionsCell from "../../../operations/cells/MoreActionsCell";
import ActionCell from "../../../operations/cells/ActionCell";
import StatusCell from "../../../operations/cells/StatusCell";
import { ReportOperationStatus } from "@bciers/utils/src/enums";
import formatTimestamp from "@bciers/utils/src/formatTimestamp";

const UpdatedAtCell = ({ row, value }: GridRenderCellParams) =>
  row.report_status && row.report_status !== ReportOperationStatus.DRAFT
    ? value
      ? formatTimestamp(value)
      : ""
    : "";

const SubmittedByCell = ({ row }: GridRenderCellParams) =>
  row.report_status && row.report_status !== ReportOperationStatus.DRAFT
    ? row.report_submitted_by
    : "";

const pastReportsColumns = (): GridColDef[] => {
  const columns: GridColDef[] = [
    { field: "reporting_year", headerName: "Reporting Year", width: 150 },
    { field: "operation_name", headerName: "Operation", width: 300 },
    {
      field: "report_updated_at",
      headerName: "Date of Submission",
      renderCell: UpdatedAtCell,
      width: 200,
    },
    {
      field: "report_submitted_by",
      headerName: "Submitted By",
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
      width: 200,
    },
  ];
  return columns;
};

export default pastReportsColumns;

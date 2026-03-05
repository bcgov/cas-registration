"use client";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import ReportHistoryActionCell from "@reporting/src/app/components/reportHistory/ActionCell";
import formatTimestamp from "@bciers/utils/src/formatTimestamp";
import { ReportOperationStatus } from "@bciers/utils/src/enums";

const UpdatedAtCell = ({ row, value }: GridRenderCellParams) => {
  if (row.status === ReportOperationStatus.DRAFT) {
    return "Not yet submitted";
  }
  return value ? formatTimestamp(value) : "—";
};
const SubmittedByCell = ({ row }: GridRenderCellParams) => {
  return row.status === ReportOperationStatus.DRAFT ? "N/A" : row.submitted_by;
};

const reportHistoryColumns = (): GridColDef[] => {
  return [
    {
      field: "version",
      headerName: "Report version",
      width: 300,
      sortable: false,
    },
    {
      field: "updated_at",
      headerName: "Date of submission",
      sortable: false,
      renderCell: UpdatedAtCell,
      width: 400,
    },
    {
      field: "submitted_by",
      headerName: "Submitted by",
      renderCell: SubmittedByCell,
      sortable: false,
      width: 400,
    },
    {
      field: "status",
      headerName: "Actions",
      renderCell: ReportHistoryActionCell,
      sortable: false,
      width: 200,
      flex: 1,
    },
  ];
};

export default reportHistoryColumns;

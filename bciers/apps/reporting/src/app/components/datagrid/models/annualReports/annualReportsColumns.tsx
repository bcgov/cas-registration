"use client";

import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import formatTimestamp from "@bciers/utils/src/formatTimestamp";
import ViewReportCell from "../../../operations/cells/ViewReportCell";
import ViewReportHistoryCell from "../../../operations/cells/ViewReportHistoryCell";

const UpdatedAtCell = ({ value }: GridRenderCellParams) =>
  formatTimestamp(value);

const AnnualReportColumns = (): GridColDef[] => {
  const columns: GridColDef[] = [
    {
      field: "operation_name",
      headerName: "Operation",
      width: 500,
      flex: 1,
    },
    {
      field: "report_updated_at",
      headerName: "Date of submission",
      renderCell: UpdatedAtCell,
      width: 180,
    },
    {
      field: "report_version_id",
      headerName: "Report Version ID",
      width: 180,
    },
    {
      field: "report",
      headerName: "Reports",
      renderCell: ViewReportCell,
      sortable: false,
      width: 240,
    },
    {
      field: "history",
      headerName: "Report History",
      renderCell: ViewReportHistoryCell,
      sortable: false,
      width: 240,
    },
  ];

  return columns;
};

export default AnnualReportColumns;

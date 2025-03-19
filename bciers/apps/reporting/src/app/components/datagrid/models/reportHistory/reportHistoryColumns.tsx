"use client";
import { GridColDef } from "@mui/x-data-grid";
import ReportHistoryActionCell from "@reporting/src/app/components/reportHistory/ActionCell";
import { formatDate } from "@reporting/src/app/utils/formatDate";

export const OPERATOR_COLUMN_INDEX = 1;

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
      renderCell: (params) => {
        if (!params.value) {
          return "";
        }
        return formatDate(params.value, "YYYY-MM-DD HH:mm:ss");
      },
      width: 400,
    },
    {
      field: "submitted_by",
      headerName: "Submitted by",
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

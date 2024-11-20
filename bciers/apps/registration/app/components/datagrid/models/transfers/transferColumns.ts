import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

const transferColumns = (
  ActionCell: (params: GridRenderCellParams) => JSX.Element,
) => {
  const columns: GridColDef[] = [
    {
      field: "created_at",
      headerName: "Submission Date",
      width: 200,
    },
    { field: "operation__name", headerName: "Operation", width: 200 },
    { field: "facilities__name", headerName: "Facility", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      width: 200,
    },
    {
      field: "effective_date",
      headerName: "Effective Date",
      width: 200,
    },
    {
      field: "action",
      headerName: "Actions",
      renderCell: ActionCell,
      sortable: false,
      width: 120,
    },
  ];

  return columns;
};

export default transferColumns;

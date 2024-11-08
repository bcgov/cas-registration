import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

const transferColumns = (
  ActionCell: (params: GridRenderCellParams) => JSX.Element,
) => {
  const columns: GridColDef[] = [
    {
      field: "submission_date",
      headerName: "Submission Date",
      sortable: false,
      // Set flex to 1 to make the column take up all the remaining width if user zooms out
      width: 200,
    },
    { field: "operation", headerName: "Operation", width: 200 },
    { field: "facilities", headerName: "Facility", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      width: 200,
    },
    {
      field: "effective_date",
      headerName: "Effective Date",
      sortable: false,
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

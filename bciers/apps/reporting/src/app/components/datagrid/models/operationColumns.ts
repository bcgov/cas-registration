import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

export const OPERATOR_COLUMN_INDEX = 1;

const operationColumns = (
  ActionCell: (params: GridRenderCellParams) => JSX.Element,
) => {
  const columns: GridColDef[] = [
    { field: "bcghg_id", headerName: "BC GHG ID", width: 160 },
    {
      field: "name",
      headerName: "Operation",
      width: 560,
    },
    {
      field: "action",
      headerName: "Action",
      renderCell: ActionCell,
      sortable: false,
      width: 120,
      // Set flex to 1 to make the column take up all the remaining width if user zooms out
      flex: 0,
    },
  ];

  return columns;
};

export default operationColumns;

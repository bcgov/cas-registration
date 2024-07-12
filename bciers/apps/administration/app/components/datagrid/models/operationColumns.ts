import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

export const OPERATOR_COLUMN_INDEX = 1;

const operationColumns = (
  isInternalUser: boolean,
  ActionCell: (params: GridRenderCellParams) => JSX.Element,
) => {
  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Operation Name",
      width: isInternalUser ? 720 : 320,
      // Set flex to 1 to make the column take up all the remaining width if user zooms out
      flex: 1,
    },
    { field: "bcghg_id", headerName: "BC GHG ID", width: 200 },
    { field: "type", headerName: "Operation Type", width: 200 },
    {
      field: "facilities",
      headerName: "Facilities",
      renderCell: ActionCell,
      width: 120,
    },
    {
      field: "action",
      headerName: "Action",
      renderCell: ActionCell,
      sortable: false,
      width: 120,
    },
  ];

  if (isInternalUser) {
    columns.splice(OPERATOR_COLUMN_INDEX, 0, {
      field: "operator",
      headerName: "Operator Legal Name",
      width: 400,
    });
  }

  return columns;
};

export default operationColumns;

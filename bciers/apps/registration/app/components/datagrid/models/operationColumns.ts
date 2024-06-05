import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import StatusStyleColumnCell from "@bciers/components/datagrid/cells/StatusStyleColumnCell";

export const OPERATOR_COLUMN_INDEX = 1;

const operationColumns = (
  isInternalUser: boolean,
  ActionCell: (params: GridRenderCellParams) => JSX.Element,
) => {
  const columns = [
    {
      field: "name",
      headerName: "Operation Name",
      width: isInternalUser ? 320 : 400,
    },
    { field: "bcghg_id", headerName: "BC GHG ID", width: 160 },
    { field: "type", headerName: "Operation Type", width: 200 },

    {
      field: "action",
      headerName: "Action",
      renderCell: ActionCell,
      sortable: false,
      width: 200,
      // Set flex to 1 to make the column take up all the remaining width if user zooms out
      flex: 1,
    },
  ] as GridColDef[];

  if (isInternalUser) {
    columns.splice(OPERATOR_COLUMN_INDEX, 0, {
      field: "operator",
      headerName: "Operator",
      width: 200,
    });
  }

  return columns;
};

export default operationColumns;

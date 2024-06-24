import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import StatusStyleColumnCell from "@bciers/components/datagrid/cells/StatusStyleColumnCell";

export const OPERATOR_COLUMN_INDEX = 1;

const operationColumns = (
  isOperatorColumn: boolean,
  ActionCell: (params: GridRenderCellParams) => JSX.Element,
) => {
  const columns = [
    { field: "bcghg_id", headerName: "BC GHG ID", width: 160 },
    {
      field: "name",
      headerName: "Operation",
      width: isOperatorColumn ? 320 : 560,
    },
    {
      field: "submission_date",
      headerName: "Submission Date",
      width: isOperatorColumn ? 200 : 220,
    },
    {
      field: "bc_obps_regulated_operation",
      headerName: "BORO ID",
      width: isOperatorColumn ? 160 : 220,
    },
    {
      field: "status",
      headerName: "Application Status",
      width: 130,
      renderCell: StatusStyleColumnCell,
    },
    {
      field: "action",
      headerName: "Action",
      renderCell: ActionCell,
      sortable: false,
      width: 120,
      // Set flex to 1 to make the column take up all the remaining width if user zooms out
      flex: 1,
    },
  ] as GridColDef[];

  if (isOperatorColumn) {
    columns.splice(OPERATOR_COLUMN_INDEX, 0, {
      field: "operator",
      headerName: "Operator",
      width: 320,
    });
  }

  return columns;
};

export default operationColumns;

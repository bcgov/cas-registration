import {
  GridColumnGroupHeaderParams,
  GridColumnGroupingModel,
} from "@mui/x-data-grid";
import EmptyGroupCell from "@bciers/components/datagrid/cells/EmptyGroupCell";

import createColumnGroup from "@bciers/components/datagrid/createColumnGrid";

const OPERATOR_COLUMN_INDEX = 1;
const facilityGroupColumns = (
  isOperatorColumn: boolean,
  SearchCell: (params: GridColumnGroupHeaderParams) => JSX.Element,
) => {
  const columnGroupModel = [
    createColumnGroup("bcghg_id", "BC GHG ID", SearchCell),
    createColumnGroup("name", "Operation", SearchCell),
    createColumnGroup("status", "Application Status", SearchCell),
    createColumnGroup("action", "Action", EmptyGroupCell),
  ] as GridColumnGroupingModel;

  if (isOperatorColumn) {
    columnGroupModel.splice(OPERATOR_COLUMN_INDEX, 0, {
      groupId: "operator",
      headerName: "Operator",
      renderHeaderGroup: SearchCell,
      children: [{ field: "operator" }],
    });
  }

  return columnGroupModel;
};

export default facilityGroupColumns;

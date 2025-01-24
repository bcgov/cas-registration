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
    createColumnGroup("report_status", "Status", EmptyGroupCell),
    createColumnGroup("actions", "Actions", EmptyGroupCell),
  ] as GridColumnGroupingModel;

  return columnGroupModel;
};

export default facilityGroupColumns;

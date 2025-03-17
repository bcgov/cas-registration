import {
  GridColumnGroupHeaderParams,
  GridColumnGroupingModel,
} from "@mui/x-data-grid";
import EmptyGroupCell from "@bciers/components/datagrid/cells/EmptyGroupCell";
import { OPERATOR_COLUMN_INDEX } from "./reportHistoryColumns";
import createColumnGroup from "@bciers/components/datagrid/createColumnGrid";

const reportHistoryGroupColumns = (
  isOperatorColumn: boolean,
  SearchCell: (params: GridColumnGroupHeaderParams) => JSX.Element,
) => {
  const columnGroupModel = [
    createColumnGroup("bcghg_id", "BC GHG ID", SearchCell),
    createColumnGroup("name", "Operation", SearchCell),
    createColumnGroup("submission_date", "Submission Date", EmptyGroupCell),
    createColumnGroup("bc_obps_regulated_operation", "BORO ID", SearchCell),
    createColumnGroup("status", "Application Status", SearchCell),
    createColumnGroup("report_status", "Status", SearchCell),
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

export default reportHistoryGroupColumns;

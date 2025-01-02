import {
  GridColumnGroupHeaderParams,
  GridColumnGroupingModel,
} from "@mui/x-data-grid";
import EmptyGroupCell from "@bciers/components/datagrid/cells/EmptyGroupCell";
import { OPERATOR_COLUMN_INDEX } from "./operationColumns";

const operationGroupColumns = (
  isOperatorColumn: boolean,
  SearchCell: (params: GridColumnGroupHeaderParams) => JSX.Element,
) => {
  const columnGroupModel = [
    {
      groupId: "bcghg_id",
      headerName: "BC GHG ID",
      renderHeaderGroup: SearchCell,
      children: [{ field: "bcghg_id" }],
    },
    {
      groupId: "name",
      headerName: "Operation",
      renderHeaderGroup: SearchCell,
      children: [{ field: "name" }],
    },
    {
      groupId: "submission_date",
      headerName: "Submission Date",
      renderHeaderGroup: EmptyGroupCell,
      children: [{ field: "submission_date" }],
    },
    {
      groupId: "bc_obps_regulated_operation",
      headerName: "BORO ID",
      renderHeaderGroup: SearchCell,
      children: [{ field: "bc_obps_regulated_operation" }],
    },
    {
      groupId: "status",
      headerName: "Application Status",
      renderHeaderGroup: SearchCell,
      children: [{ field: "status" }],
    },
    {
      groupId: "report_status",
      headerName: "Status",
      renderHeaderGroup: SearchCell,
      children: [{ field: "report_status" }],
    },
    {
      groupId: "action",
      headerName: "Action",
      renderHeaderGroup: EmptyGroupCell,
      children: [{ field: "action" }],
    },
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

export default operationGroupColumns;

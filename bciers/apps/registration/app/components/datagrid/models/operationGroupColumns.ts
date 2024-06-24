import {
  GridColumnGroupHeaderParams,
  GridColumnGroupingModel,
} from "@mui/x-data-grid";
import EmptyGroupCell from "@bciers/components/datagrid/cells/EmptyGroupCell";
import { OPERATOR_COLUMN_INDEX } from "@bciers/components/datagrid/models/operationColumns";

const operationGroupColumns = (
  isInternalUser: boolean,
  SearchCell: (params: GridColumnGroupHeaderParams) => JSX.Element,
) => {
  const columnGroupModel: GridColumnGroupingModel = [
    {
      groupId: "bcghg_id",
      headerName: "BC GHG ID",
      renderHeaderGroup: SearchCell,
      children: [{ field: "bcghg_id" }],
    },
    {
      groupId: "name",
      headerName: "Operation Name",
      renderHeaderGroup: SearchCell,
      children: [{ field: "name" }],
    },
    {
      groupId: "type",
      headerName: "Operation Type",
      renderHeaderGroup: SearchCell,
      children: [{ field: "type" }],
    },

    {
      groupId: "action",
      headerName: "Action",
      renderHeaderGroup: EmptyGroupCell,
      children: [{ field: "action" }],
    },
  ];

  if (isInternalUser) {
    columnGroupModel.splice(OPERATOR_COLUMN_INDEX, 0, {
      groupId: "operator",
      headerName: "Operator Legal Name",
      renderHeaderGroup: SearchCell,
      children: [{ field: "operator" }],
    });
  }

  return columnGroupModel;
};

export default operationGroupColumns;

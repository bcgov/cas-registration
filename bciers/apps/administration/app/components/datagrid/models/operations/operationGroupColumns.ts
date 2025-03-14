import {
  GridColumnGroupHeaderParams,
  GridColumnGroupingModel,
} from "@mui/x-data-grid";
import EmptyGroupCell from "@bciers/components/datagrid/cells/EmptyGroupCell";
import { OPERATOR_COLUMN_INDEX } from "./operationColumns";

const operationGroupColumns = (
  isInternalUser: boolean,
  SearchCell: (params: GridColumnGroupHeaderParams) => JSX.Element,
) => {
  let columnGroupModel: GridColumnGroupingModel = [
    {
      groupId: "operation__bcghg_id",
      headerName: "BC GHG ID",
      renderHeaderGroup: SearchCell,
      children: [{ field: "operation__bcghg_id" }],
    },
    {
      groupId: "operation__name",
      headerName: "Operation Name",
      renderHeaderGroup: SearchCell,
      children: [{ field: "operation__name" }],
    },
    {
      groupId: "operation__type",
      headerName: "Operation Type",
      renderHeaderGroup: SearchCell,
      children: [{ field: "operation__type" }],
    },
    {
      groupId: "operation__bc_obps_regulated_operation",
      headerName: "BORO ID",
      renderHeaderGroup: SearchCell,
      children: [{ field: "operation__bc_obps_regulated_operation" }],
    },
    {
      groupId: "operation__status",
      headerName: "Status",
      renderHeaderGroup: SearchCell,
      children: [{ field: "operation__status" }],
    },
    {
      groupId: "action",
      headerName: "Action",
      renderHeaderGroup: EmptyGroupCell,
      children: [{ field: "action" }],
    },
  ];

  if (isInternalUser) {
    // Add operator column if user is internal
    columnGroupModel.splice(OPERATOR_COLUMN_INDEX, 0, {
      groupId: "operator__legal_name",
      headerName: "Operator Legal Name",
      renderHeaderGroup: SearchCell,
      children: [{ field: "operator__legal_name" }],
    });
    // Remove status column if user is internal
    columnGroupModel = columnGroupModel.filter(
      (column) => column.groupId !== "operation__status",
    );
  }

  return columnGroupModel;
};

export default operationGroupColumns;

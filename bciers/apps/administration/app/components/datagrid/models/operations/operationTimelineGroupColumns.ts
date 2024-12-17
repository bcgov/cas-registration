import {
  GridColumnGroupHeaderParams,
  GridColumnGroupingModel,
} from "@mui/x-data-grid";
import EmptyGroupCell from "@bciers/components/datagrid/cells/EmptyGroupCell";
import { OPERATOR_COLUMN_INDEX } from "./operationColumns";

const operationTimelineGroupColumns = (
  isInternalUser: boolean,
  SearchCell: (params: GridColumnGroupHeaderParams) => JSX.Element,
) => {
  const columnGroupModel: GridColumnGroupingModel = [
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
      groupId: "status",
      headerName: "Status",
      renderHeaderGroup: SearchCell,
      children: [{ field: "status" }],
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
      groupId: "operator__legal_name",
      headerName: "Operator Legal Name",
      renderHeaderGroup: SearchCell,
      children: [{ field: "operator__legal_name" }],
    });
  }

  return columnGroupModel;
};

export default operationTimelineGroupColumns;

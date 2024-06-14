import {
  GridColumnGroupHeaderParams,
  GridColumnGroupingModel,
} from "@mui/x-data-grid";
import EmptyGroupCell from "@bciers/components/datagrid/cells/EmptyGroupCell";

const facilityGroupColumns = (
  SearchCell: (params: GridColumnGroupHeaderParams) => JSX.Element,
) => {
  const columnGroupModel: GridColumnGroupingModel = [
    {
      groupId: "name",
      headerName: "Facility Name",
      renderHeaderGroup: SearchCell,
      children: [{ field: "name" }],
    },
    {
      groupId: "type",
      headerName: "Facility Type",
      renderHeaderGroup: SearchCell,
      children: [{ field: "type" }],
    },
    {
      groupId: "bcghg_id",
      headerName: "BC GHG ID",
      renderHeaderGroup: SearchCell,
      children: [{ field: "bcghg_id" }],
    },
    {
      groupId: "action",
      headerName: "Actions",
      renderHeaderGroup: EmptyGroupCell,
      children: [{ field: "action" }],
    },
  ];

  return columnGroupModel;
};

export default facilityGroupColumns;

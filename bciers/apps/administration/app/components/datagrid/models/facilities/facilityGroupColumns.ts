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
      groupId: "facility__name",
      headerName: "Facility Name",
      renderHeaderGroup: SearchCell,
      children: [{ field: "facility__name" }],
    },
    {
      groupId: "facility__type",
      headerName: "Facility Type",
      renderHeaderGroup: SearchCell,
      children: [{ field: "facility__type" }],
    },
    {
      groupId: "facility__bcghg_id__id",
      headerName: "BC GHG ID",
      renderHeaderGroup: SearchCell,
      children: [{ field: "facility__bcghg_id__id" }],
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

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
      groupId: "facility_name",
      headerName: "Facility Name",
      renderHeaderGroup: SearchCell,
      children: [{ field: "facility_name" }],
    },
    {
      groupId: "facility_type",
      headerName: "Facility Type",
      renderHeaderGroup: SearchCell,
      children: [{ field: "facility_type" }],
    },
    {
      groupId: "status",
      headerName: "Status",
      renderHeaderGroup: SearchCell,
      children: [{ field: "status" }],
    },
    {
      groupId: "facility_bcghg_id",
      headerName: "BC GHG ID",
      renderHeaderGroup: SearchCell,
      children: [{ field: "facility_bcghg_id" }],
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

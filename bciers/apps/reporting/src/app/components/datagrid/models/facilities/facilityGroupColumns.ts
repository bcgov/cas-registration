import {
  GridColumnGroupHeaderParams,
  GridColumnGroupingModel,
} from "@mui/x-data-grid";
import EmptyGroupCell from "@bciers/components/datagrid/cells/EmptyGroupCell";

const facilityTableGroupColumns = (
  SearchCell: (params: GridColumnGroupHeaderParams) => JSX.Element,
) => {
  {
    const columnGroupModel: GridColumnGroupingModel = [
      {
        groupId: "facility_bcghgid",
        headerName: "Facility BCGHG ID",
        renderHeaderGroup: SearchCell,
        children: [{ field: "facility_bcghgid" }],
      },
      {
        groupId: "facility_name",
        headerName: "Facility Name",
        renderHeaderGroup: SearchCell,
        children: [{ field: "facility_name" }],
      },
      {
        groupId: "is_completed",
        headerName: "Status",
        renderHeaderGroup: EmptyGroupCell,
        children: [{ field: "is_completed" }],
      },
      {
        groupId: "actions",
        headerName: "Actions",
        renderHeaderGroup: EmptyGroupCell,
        children: [{ field: "actions" }],
      },
    ];

    return columnGroupModel;
  }
};
export default facilityTableGroupColumns;

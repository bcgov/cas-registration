import {
  GridColumnGroupHeaderParams,
  GridColumnGroupingModel,
} from "@mui/x-data-grid";
import EmptyGroupCell from "@bciers/components/datagrid/cells/EmptyGroupCell";

const transferGroupColumns = (
  SearchCell: (params: GridColumnGroupHeaderParams) => JSX.Element,
) => {
  const columnGroupModel: GridColumnGroupingModel = [
    {
      groupId: "created_at",
      headerName: "Submission Date",
      renderHeaderGroup: EmptyGroupCell,
      children: [{ field: "created_at" }],
    },
    {
      groupId: "operation__name",
      headerName: "Operation",
      renderHeaderGroup: SearchCell,
      children: [{ field: "operation__name" }],
    },
    {
      groupId: "facilities__name",
      headerName: "Facility",
      renderHeaderGroup: SearchCell,
      children: [{ field: "facilities__name" }],
    },
    {
      groupId: "status",
      headerName: "Status",
      renderHeaderGroup: SearchCell,
      children: [{ field: "status" }],
    },
    {
      groupId: "effective_date",
      headerName: "Effective Date",
      renderHeaderGroup: EmptyGroupCell,
      children: [{ field: "effective_date" }],
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

export default transferGroupColumns;

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
      groupId: "submission_date",
      headerName: "Submission Date",
      renderHeaderGroup: EmptyGroupCell,
      children: [{ field: "submission_date" }],
    },
    {
      groupId: "operation",
      headerName: "Operation",
      renderHeaderGroup: SearchCell,
      children: [{ field: "operation" }],
    },
    {
      groupId: "facilities",
      headerName: "Facility",
      renderHeaderGroup: SearchCell,
      children: [{ field: "facilities" }],
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

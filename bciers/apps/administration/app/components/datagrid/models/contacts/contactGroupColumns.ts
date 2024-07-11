import {
  GridColumnGroupHeaderParams,
  GridColumnGroupingModel,
} from "@mui/x-data-grid";
import EmptyGroupCell from "@bciers/components/datagrid/cells/EmptyGroupCell";

const contactGroupColumns = (
  isExternalUser: boolean,
  SearchCell: (params: GridColumnGroupHeaderParams) => JSX.Element,
) => {
  const columnGroupModel: GridColumnGroupingModel = [
    {
      groupId: "first_name",
      headerName: "Facility Name",
      renderHeaderGroup: SearchCell,
      children: [{ field: "first_name" }],
    },
    {
      groupId: "last_name",
      headerName: "Last Name",
      renderHeaderGroup: SearchCell,
      children: [{ field: "last_name" }],
    },
    {
      groupId: "email",
      headerName: "Business Email Address",
      renderHeaderGroup: SearchCell,
      children: [{ field: "email" }],
    },
    {
      groupId: "operator_legal_name",
      headerName: "Operator Legal Name",
      renderHeaderGroup: EmptyGroupCell,
      children: [{ field: "operator_legal_name" }],
    },
    {
      groupId: "operation_name",
      headerName: "Operation Name",
      renderHeaderGroup: EmptyGroupCell,
      children: [{ field: "operation_name" }],
    },
    {
      groupId: "action",
      headerName: "Actions",
      renderHeaderGroup: EmptyGroupCell,
      children: [{ field: "action" }],
    },
  ];

  if (isExternalUser) {
    // remove operator_legal_name and operation_name columns for external users
    columnGroupModel.splice(3, 2);
  }

  return columnGroupModel;
};

export default contactGroupColumns;

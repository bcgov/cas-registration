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
      headerName: "First Name",
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
      groupId: "operators__legal_name",
      headerName: "Operator Legal Name",
      renderHeaderGroup: SearchCell,
      children: [{ field: "operators__legal_name" }],
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

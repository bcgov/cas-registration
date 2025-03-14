import { GridColumnGroupHeaderParams } from "@mui/x-data-grid";
import EmptyGroupCell from "@bciers/components/datagrid/cells/EmptyGroupCell";

const userOperatorGroupColumns = (
  SearchCell: (params: GridColumnGroupHeaderParams) => JSX.Element,
) => {
  return [
    {
      groupId: "user_friendly_id",
      headerName: "Request ID",
      renderHeaderGroup: SearchCell,
      children: [{ field: "user_friendly_id" }],
    },
    {
      groupId: "user__first_name",
      headerName: "First Name",
      renderHeaderGroup: SearchCell,
      children: [{ field: "user__first_name" }],
    },
    {
      groupId: "user__last_name",
      headerName: "Last Name",
      renderHeaderGroup: SearchCell,
      children: [{ field: "user__last_name" }],
    },
    {
      groupId: "user__email",
      headerName: "Email",
      renderHeaderGroup: SearchCell,
      children: [{ field: "user__email" }],
    },
    {
      groupId: "user__bceid_business_name",
      headerName: "BCeID Business Name",
      renderHeaderGroup: SearchCell,
      children: [{ field: "user__bceid_business_name" }],
    },
    {
      groupId: "operator__legal_name",
      headerName: "Operator",
      renderHeaderGroup: SearchCell,
      children: [{ field: "operator__legal_name" }],
    },
    {
      groupId: "role",
      headerName: "Role",
      renderHeaderGroup: SearchCell,
      children: [{ field: "role" }],
    },
    {
      groupId: "action",
      headerName: "Actions",
      renderHeaderGroup: EmptyGroupCell,
      children: [{ field: "action" }],
    },
  ];
};

export default userOperatorGroupColumns;

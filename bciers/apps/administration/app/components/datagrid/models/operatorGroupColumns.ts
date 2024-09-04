import {
  GridColumnGroupHeaderParams,
  GridColumnGroupingModel,
} from "@mui/x-data-grid";
import EmptyGroupCell from "@bciers/components/datagrid/cells/EmptyGroupCell";
import { OPERATOR_COLUMN_INDEX } from "apps/administration/app/components/datagrid/models/operationColumns";

const operationGroupColumns = (
  SearchCell: (params: GridColumnGroupHeaderParams) => JSX.Element,
) => {
  const columnGroupModel: GridColumnGroupingModel = [
    {
      groupId: "legal_name",
      headerName: "Legal Name",
      renderHeaderGroup: SearchCell,
      children: [{ field: "legal_name" }],
    },
    {
      groupId: "business_structure",
      headerName: "Business Structure",
      renderHeaderGroup: SearchCell,
      children: [{ field: "business_structure" }],
    },
    {
      groupId: "cra_business_number",
      headerName: "CRA Business Number",
      renderHeaderGroup: SearchCell,
      children: [{ field: "cra_business_number" }],
    },
    {
      groupId: "bc_corporate_registry_number",
      headerName: "BC Corporate Registry Number",
      renderHeaderGroup: SearchCell,
      children: [{ field: "bc_corporate_registry_number" }],
    },
    {
      groupId: "action",
      headerName: "Action",
      renderHeaderGroup: EmptyGroupCell,
      children: [{ field: "action" }],
    },
  ];

  return columnGroupModel;
};

export default operationGroupColumns;

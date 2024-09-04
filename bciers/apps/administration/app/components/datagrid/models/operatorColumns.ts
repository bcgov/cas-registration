import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

export const OPERATOR_COLUMN_INDEX = 1;

const operatorColumns = (
  isInternalUser: boolean,
  ActionCell: (params: GridRenderCellParams) => JSX.Element,
) => {
  const columns: GridColDef[] = [
    {
      field: "legal_name",
      headerName: "Legal Name",
      flex: 1,
    },
    {
      field: "business_structure",
      headerName: "Business Structure",
      flex: 1,
    },
    {
      field: "cra_business_number",
      headerName: "CRA Business Number",
      flex: 1,
    },
    {
      field: "bc_corporate_registry_number",
      headerName: "BC Corporate Registry Number",
      flex: 1,
    },
    {
      field: "action",
      headerName: "Actions",
      renderCell: ActionCell,
      sortable: false,
      width: 150,
    },
  ];

  return columns;
};

export default operatorColumns;

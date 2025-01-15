import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

const contactColumns = (
  isExternalUser: boolean,
  ActionCell: (params: GridRenderCellParams) => JSX.Element,
) => {
  const columns: GridColDef[] = [
    {
      field: "first_name",
      headerName: "First Name",
      // Set flex to 1 to make the column take up all the remaining width if user zooms out
      flex: 1,
    },
    { field: "last_name", headerName: "Last Name", flex: 1 },
    { field: "email", headerName: "Business Email Address", flex: 1 },
    {
      field: "operators__legal_name",
      headerName: "Operator Legal Name",
      flex: 1,
    },
    {
      field: "action",
      headerName: "Actions",
      renderCell: ActionCell,
      sortable: false,
      width: 120,
    },
  ];

  if (isExternalUser) {
    // remove operator_legal_name and operation_name columns for external users
    columns.splice(3, 1);
  }

  return columns;
};

export default contactColumns;

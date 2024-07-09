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
      width: 200,
    },
    { field: "last_name", headerName: "Last Name", width: 200 },
    { field: "email", headerName: "Business Email Address", flex: 1 },
    // Two below fields don't exist in the data coming from the server(until we figure out how to get them)
    {
      field: "operation_name",
      headerName: "Operation Name",
      sortable: false,
      width: 200,
    },
    {
      field: "operator_legal_name",
      headerName: "Operator Legal Name",
      sortable: false,
      width: 200,
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
    columns.splice(3, 2);
  }

  return columns;
};

export default contactColumns;

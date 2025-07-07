import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { regulatedOperationPurposes } from "@/registration/app/components/operations/registration/enums";

export const OPERATOR_COLUMN_INDEX = 1;

const operationColumns = (
  isInternalUser: boolean,
  ActionCell: (params: GridRenderCellParams) => JSX.Element,
  FacilitiesActionCell: (params: GridRenderCellParams) => JSX.Element,
) => {
  let columns: GridColDef[] = [
    {
      field: "operation__name",
      headerName: "Operation Name",
      // Set flex to 1 to make the column take up all the remaining width if user zooms out
      flex: 1,
    },
    { field: "operation__type", headerName: "Operation Type", width: 200 },
    {
      field: "operation__bc_obps_regulated_operation",
      headerName: "BORO ID",
      width: 120,
      valueGetter: (params) => {
        const {
          operation__bc_obps_regulated_operation: boroId,
          operation__registration_purpose: purpose,
        } = params?.row || {};

        switch (true) {
          case !purpose:
            return ""; // Return empty string if operation purpose is not defined
          case !!boroId:
            return boroId; // Return 'boroId' if it exists
          case regulatedOperationPurposes.includes(purpose):
            return "Pending"; // Return "Pending" if 'purpose' is in the list
          default:
            return "N/A"; // Default case
        }
      },
    },
    { field: "operation__bcghg_id", headerName: "BC GHG ID", width: 120 },
    { field: "operation__status", headerName: "Status", width: 100 },
    {
      field: "facilities",
      headerName: "Facilities",
      renderCell: FacilitiesActionCell,
      sortable: false,
      width: 140,
    },
    {
      field: "action",
      headerName: "Action",
      renderCell: ActionCell,
      sortable: false,
      width: 150,
    },
  ];

  if (isInternalUser) {
    // Add operator column if user is internal
    columns.splice(OPERATOR_COLUMN_INDEX, 0, {
      field: "operator__legal_name",
      headerName: "Operator Legal Name",
      width: 250,
    });
    // Remove status column if user is internal
    columns = columns.filter((column) => column.field !== "operation__status");
  }

  return columns;
};

export default operationColumns;

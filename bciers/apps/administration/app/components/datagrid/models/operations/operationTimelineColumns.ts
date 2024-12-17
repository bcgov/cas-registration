import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

export const OPERATOR_COLUMN_INDEX = 1;

const operationTimelineColumns = (
  isInternalUser: boolean,
  ActionCell: (params: GridRenderCellParams) => JSX.Element,
  FacilitiesActionCell: (params: GridRenderCellParams) => JSX.Element,
) => {
  const columns: GridColDef[] = [
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
      valueGetter: (params) => params.row?.bc_obps_regulated_operation ?? "N/A",
    },
    { field: "operation__bcghg_id", headerName: "BC GHG ID", width: 120 },
    { field: "status", headerName: "Status", width: 100 },
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
    columns.splice(OPERATOR_COLUMN_INDEX, 0, {
      field: "operator__legal_name",
      headerName: "Operator Legal Name",
      width: 250,
    });
  }

  return columns;
};

export default operationTimelineColumns;

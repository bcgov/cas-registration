import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

const facilityColumns = (
  ActionCell: (params: GridRenderCellParams) => JSX.Element,
) => {
  const columns: GridColDef[] = [
    {
      field: "facility_name",
      headerName: "Facility Name",
      // Set flex to 1 to make the column take up all the remaining width if user zooms out
      flex: 1,
    },
    { field: "facility_type", headerName: "Facility Type", width: 200 },
    { field: "status", headerName: "Status", width: 200 },
    { field: "facility_bcghg_id", headerName: "BC GHG ID", width: 200 },
    {
      field: "action",
      headerName: "Actions",
      renderCell: ActionCell,
      sortable: false,
      width: 120,
    },
  ];

  return columns;
};

export default facilityColumns;

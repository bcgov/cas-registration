import { GridColDef } from "@mui/x-data-grid";

const penaltyAccrualColumns = (): GridColDef[] => {
  return [
    {
      field: "date",
      headerName: "Date",
      minWidth: 140,
      flex: 1,
      sortable: false,
      type: "string",
    },
    {
      field: "daily_penalty",
      headerName: "Daily Penalty",
      minWidth: 160,
      flex: 1,
      sortable: false,
      type: "string",
    },
    {
      field: "daily_compounded",
      headerName: "Daily compounded",
      minWidth: 170,
      flex: 1,
      sortable: false,
      type: "string",
    },
    {
      field: "accumulated_penalty",
      headerName: "Accumulated penalty",
      minWidth: 190,
      flex: 1,
      sortable: false,
      type: "string",
    },
    {
      field: "accumulated_compounded",
      headerName: "Accumulated compounded",
      minWidth: 220,
      flex: 1,
      sortable: false,
      type: "string",
    },
    {
      field: "interest_rate",
      headerName: "Interest rate %",
      minWidth: 150,
      flex: 1,
      sortable: false,
      type: "string",
    },
  ];
};

export default penaltyAccrualColumns;

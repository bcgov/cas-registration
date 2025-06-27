import { GridColDef } from "@mui/x-data-grid";

const complianceUnitsColumns = (): GridColDef[] => {
  return [
    {
      field: "type",
      headerName: "Type",
      width: 100,
      type: "string",
    },
    {
      field: "serial_number",
      headerName: "Serial Number",
      width: 200,
      flex: 1,
      type: "string",
      cellClassName: "text-left break-all",
    },
    {
      field: "vintage_year",
      headerName: "Vintage Year",
      width: 120,
      type: "string",
    },
    {
      field: "quantity_applied",
      headerName: "Quantity",
      width: 150,
      type: "string",
      valueFormatter: (params) => `${Number(params.value).toFixed(0)}`,
      sortComparator: (a, b) => a - b,
    },
    {
      field: "equivalent_emission_reduced",
      headerName: "Equivalent Emission Reduced",
      width: 200,
      type: "string",
      valueGetter: (params) => {
        return !params.row.quantity_applied
          ? 0
          : Number(params.row.quantity_applied);
      },
      valueFormatter: (params) => `${params.value} tCO2e`,
      sortComparator: (a, b) => a - b,
    },
    {
      field: "equivalent_value",
      headerName: "Equivalent Value",
      width: 150,
      type: "string",
      valueFormatter: (params) =>
        `$${Number(params.value).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
    },
  ];
};

export default complianceUnitsColumns;

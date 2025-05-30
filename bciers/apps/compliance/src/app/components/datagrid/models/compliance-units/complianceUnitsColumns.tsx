import { formatMonetaryValue } from "@/compliance/src/app/utils/formatting";
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
      field: "serialNumber",
      headerName: "Serial Number",
      width: 200,
      type: "string",
    },
    {
      field: "vintageYear",
      headerName: "Vintage Year",
      width: 120,
      type: "string",
    },
    {
      field: "quantityApplied",
      headerName: "Quantity Applied",
      width: 150,
      type: "string",
    },
    {
      field: "equivalentEmissionReduced",
      headerName: "Equivalent Emission Reduced",
      width: 200,
      type: "string",
      valueFormatter: (params) => `${params.value} tCO2e`,
    },
    {
      field: "equivalentValue",
      headerName: "Equivalent Value",
      width: 150,
      type: "string",
      valueFormatter: (params) => formatMonetaryValue(Number(params.value)),
    },
    {
      field: "status",
      headerName: "Status",
      type: "string",
      flex: 1,
    },
  ];
};

export default complianceUnitsColumns;

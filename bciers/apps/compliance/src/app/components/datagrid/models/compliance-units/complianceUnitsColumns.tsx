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
      width: 150,
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
    },
    {
      field: "equivalentValue",
      headerName: "Equivalent Value",
      width: 150,
      type: "string",
    },
    {
      field: "status",
      headerName: "Status",
      width: 136,
      type: "string",
    },
  ];
};

export default complianceUnitsColumns;

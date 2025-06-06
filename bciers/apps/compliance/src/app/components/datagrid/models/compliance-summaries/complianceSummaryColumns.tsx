import { GridColDef } from "@mui/x-data-grid";
import ActionCell from "@/compliance/src/app/components/compliance-summaries/cells/ActionCell";

const complianceSummaryColumns = (): GridColDef[] => {
  return [
    {
      field: "reporting_year",
      headerName: "Compliance Period",
      width: 150,
    },
    {
      field: "operation_name",
      headerName: "Operation Name",
      width: 200,
    },
    {
      field: "excess_emissions",
      headerName: "Excess Emission",
      width: 200,
      valueFormatter: (params) => `${params.value} tCO2e`,
    },
    {
      field: "outstanding_balance",
      headerName: "Outstanding Balance",
      width: 200,
      valueFormatter: (params) => `${params.value} tCO2e`,
    },
    {
      field: "status",
      headerName: "Compliance Status",
      width: 200,
    },
    {
      field: "penalty_status",
      headerName: "Penalty Status",
      width: 150,
    },
    {
      field: "obligation_id",
      headerName: "Obligation ID",
      width: 150,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: ActionCell,
    },
  ];
};

export default complianceSummaryColumns;

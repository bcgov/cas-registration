import { GridColDef } from "@mui/x-data-grid";
import { ComplianceSummary } from "../../../../components/compliance-summaries/types";
import ActionCellFactory from "@bciers/components/datagrid/cells/ActionCellFactory";

const complianceSummaryColumns = (): GridColDef[] => {
  const ActionCell = ActionCellFactory({
    generateHref: (params: { row: ComplianceSummary }) =>
      `/compliance-summaries/${params.row.id}`,
    cellText: "View Details",
  });

  return [
    {
      field: "reporting_year",
      headerName: "Reporting Year",
      width: 150,
      type: "string",
    },
    {
      field: "operation_name",
      headerName: "Operation Name",
      width: 200,
      type: "string",
    },
    {
      field: "excess_emissions",
      headerName: "Excess Emission",
      width: 200,
      type: "number",
      valueFormatter: (params) => `${params.value} tCO2e`,
    },
    {
      field: "outstanding_balance",
      headerName: "Outstanding Balance",
      width: 200,
      type: "number",
      valueGetter: (params) => params.row.excess_emissions,
      valueFormatter: (params) => `${params.value} tCO2e`,
    },
    {
      field: "compliance_status",
      headerName: "Compliance Status",
      width: 200,
      type: "string",
    },
    {
      field: "penalty_status",
      headerName: "Penalty Status",
      width: 150,
      type: "string",
    },
    {
      field: "obligation_id",
      headerName: "Obligation ID",
      width: 150,
      type: "string",
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      type: "actions",
      renderCell: ActionCell,
    },
  ];
};

export default complianceSummaryColumns;

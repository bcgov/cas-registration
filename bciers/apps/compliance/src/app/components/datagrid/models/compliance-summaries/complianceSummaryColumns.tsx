import { GridColDef } from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import Link from "next/link";
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
      field: "reportingYear",
      headerName: "Reporting Year",
      width: 150,
      type: "string",
    },
    {
      field: "operationName",
      headerName: "Operation Name",
      width: 200,
      type: "string",
    },
    {
      field: "excessEmissions",
      headerName: "Excess Emission",
      width: 200,
      type: "number",
      valueFormatter: (params) => `${params.value} tCO2e`,
    },
    {
      field: "outstandingBalance",
      headerName: "Outstanding Balance",
      width: 200,
      type: "number",
      valueFormatter: (params) => `${params.value} tCO2e`,
    },
    {
      field: "complianceStatus",
      headerName: "Compliance Status",
      width: 200,
      type: "string",
    },
    {
      field: "penaltyStatus",
      headerName: "Penalty Status",
      width: 150,
      type: "string",
    },
    {
      field: "obligationId",
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

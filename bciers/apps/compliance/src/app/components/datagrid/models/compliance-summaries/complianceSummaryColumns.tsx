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
      type: "number",
    },
    {
      field: "operationName",
      headerName: "Operation Name",
      width: 200,
      type: "string",
    },
    {
      field: "excessEmissions",
      headerName: "Excess Emissions (tCO2e)",
      width: 200,
      type: "number",
    },
    {
      field: "outstandingBalance",
      headerName: "Outstanding Balance",
      width: 200,
      type: "number",
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

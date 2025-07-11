import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import ActionCell from "@/compliance/src/app/components/compliance-summaries/cells/ActionCell";

const PenaltyStatusCell = ({ row }: GridRenderCellParams) => {
  return row.penalty_status ? row.penalty_status : "N/A";
};
const ObligationIDCell = ({ row }: GridRenderCellParams) => {
  return row.obligation_id ? row.obligation_id : "N/A";
};

const complianceSummaryColumns = (isAllowedCas: boolean): GridColDef[] => {
  // Adjust widths based on whether we have the extra operator column
  const getColumnWidth = (baseWidth: number, casWidth: number) =>
    isAllowedCas ? casWidth : baseWidth;

  const columns: GridColDef[] = [
    {
      field: "reporting_year",
      headerName: "Compliance Period",
      width: getColumnWidth(150, 130),
    },
    {
      field: "operation_name",
      headerName: "Operation Name",
      width: getColumnWidth(200, 160),
    },
    {
      field: "excess_emissions",
      headerName: "Excess Emission",
      width: getColumnWidth(180, 150),
      valueFormatter: (params) => `${params.value} tCO2e`,
    },
    {
      field: "outstanding_balance_tco2e",
      headerName: "Outstanding Balance",
      width: getColumnWidth(200, 170),
      valueFormatter: (params) => `${params.value} tCO2e`,
    },
    {
      field: "status",
      headerName: "Compliance Status",
      width: getColumnWidth(200, 160),
    },
    {
      field: "penalty_status",
      headerName: "Penalty Status",
      renderCell: PenaltyStatusCell,
      width: getColumnWidth(150, 120),
    },
    {
      field: "obligation_id",
      headerName: "Obligation ID",
      renderCell: ObligationIDCell,
      width: 140,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: getColumnWidth(120, 100),
      flex: 1,
      renderCell: (params) => {
        return <ActionCell {...params} isAllowedCas={isAllowedCas} />;
      },
    },
  ];

  if (isAllowedCas) {
    columns.splice(1, 0, {
      field: "operator_name",
      headerName: "Operator Name",
      width: 200,
    });
  }

  return columns;
};

export default complianceSummaryColumns;

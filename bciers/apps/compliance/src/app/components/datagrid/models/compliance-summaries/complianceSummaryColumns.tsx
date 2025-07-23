import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import ActionCell from "@/compliance/src/app/components/compliance-summaries/cells/ActionCell";
import {
  ComplianceSummaryStatus,
  IssuanceStatus,
} from "@bciers/utils/src/enums";

const PenaltyStatusCell = ({ row }: GridRenderCellParams) => {
  if (!row.penalty_status || row.penalty_status === "NONE") {
    return "N/A";
  }
  return row.penalty_status;
};
const ObligationIDCell = ({ row }: GridRenderCellParams) => {
  return row.obligation_id ? row.obligation_id : "N/A";
};

const ComplianceStatusCell = ({ row }: GridRenderCellParams) => {
  switch (row.status) {
    case ComplianceSummaryStatus.OBLIGATION_NOT_MET:
      return "Obligation - not met";
    case ComplianceSummaryStatus.OBLIGATION_FULLY_MET:
      return "Obligation - met";
    case ComplianceSummaryStatus.EARNED_CREDITS:
      switch (row.issuance_status) {
        case IssuanceStatus.CREDITS_NOT_ISSUED:
          return "Earned credits - not requested";
        case IssuanceStatus.ISSUANCE_REQUESTED:
          return "Earned credits - issuance requested";
        case IssuanceStatus.APPROVED:
          return "Earned credits - approved";
        case IssuanceStatus.DECLINED:
          return "Earned credits - declined";
        case IssuanceStatus.CHANGES_REQUIRED:
          return "Earned credits - changes required";
        default:
          return "Earned credits";
      }
    case ComplianceSummaryStatus.NO_OBLIGATION_OR_EARNED_CREDITS:
      return "No obligation or earned credits";
    default:
      return "N/A";
  }
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
      renderCell: ComplianceStatusCell,
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

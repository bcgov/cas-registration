import { GridRenderCellParams } from "@mui/x-data-grid";
import ActionCellFactory from "@bciers/components/datagrid/cells/ActionCellFactory";
import { ComplianceSummary } from "@/compliance/src/app/utils/getComplianceSummary";

const ActionCell = (params: GridRenderCellParams) => {
  let cellText = "View Details";

  if (params.row.obligation_id) {
    cellText = "Manage Obligation";
  } else if (params.row.status === "Earned credits") {
    cellText = "Request Issuance of Credits";
  }

  const cell = ActionCellFactory({
    generateHref: (p: { row: ComplianceSummary }) => {
      let basePath = `/compliance-summaries/${p.row.id}`;

      if (p.row.obligation_id) {
        basePath += "/review-compliance-summary";
      } else if (p.row.compliance_status === "Earned credits") {
        basePath += "/review-compliance-summary";
      }
      return basePath;
    },
    cellText: cellText,
  });

  return cell(params);
};

export default ActionCell;

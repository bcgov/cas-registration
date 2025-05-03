import { GridRenderCellParams } from "@mui/x-data-grid";
import ActionCellFactory from "@bciers/components/datagrid/cells/ActionCellFactory";
import { ComplianceSummary } from "../../compliance-summaries/types";

const ActionCell = (params: GridRenderCellParams) => {
  let cellText = "View Details";

  if (params.row.obligation_id) {
    cellText = "Manage Obligation";
  } else if (params.row.compliance_status === "Earned credits") {
    cellText = "Request Issuance of Credits";
  }

  const cell = ActionCellFactory({
    generateHref: (p: { row: ComplianceSummary }) => {
      if (p.row.obligation_id) {
        return `/compliance-summaries/${p.row.id}/manage-obligation/review-compliance-summary`;
      } else if (p.row.compliance_status === "Earned credits") {
        return `/compliance-summaries/${p.row.id}/request-issuance/review-compliance-summary`;
      } else {
        return `/compliance-summaries/${p.row.id}`;
      }
    },
    cellText: cellText,
  });

  return cell(params);
};

export default ActionCell;

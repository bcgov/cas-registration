import { GridRenderCellParams } from "@mui/x-data-grid";
import ActionCellFactory from "@bciers/components/datagrid/cells/ActionCellFactory";
import { ComplianceSummary } from "@/compliance/src/app/types";

interface ActionCellProps extends GridRenderCellParams {
  isCasStaff?: boolean;
  actionedECs: any[];
}

const ActionCell = (params: ActionCellProps) => {
  let cellText = "View Details";

  if (params.row.obligation_id) {
    cellText = "Manage Obligation";
  } else if (params.row.status === "Earned credits") {
    if (params.isCasStaff && params.actionedECs.includes(params.id)) {
      cellText = "Review Credits Issuance Request";
    } else {
      cellText = "Request Issuance of Credits";
    }
  }

  const cell = ActionCellFactory({
    generateHref: (p: { row: ComplianceSummary }) => {
      let basePath = `/compliance-summaries/${p.row.id}`;

      if (p.row.obligation_id) {
        basePath += "/manage-obligation-review-summary";
      } else if (p.row.status === "Earned credits") {
        if (params.isCasStaff && params.actionedECs.includes(params.id)) {
          basePath += "/request-issuance-review-summary";
        } else {
          basePath += "/request-issuance-of-earned-credits";
        }
      }
      return basePath;
    },
    cellText: cellText,
  });

  return cell(params);
};

export default ActionCell;

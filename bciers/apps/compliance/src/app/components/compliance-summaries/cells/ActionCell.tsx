import { GridRenderCellParams } from "@mui/x-data-grid";
import ActionCellFactory from "@bciers/components/datagrid/cells/ActionCellFactory";
import { ComplianceSummary } from "@/compliance/src/app/types";

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
        basePath += "/manage-obligation-review-summary";
      } else if (p.row.status === "Earned credits") {
        basePath += "/request-issuance-review-summary";
      }
      return basePath;
    },
    cellText: cellText,
  });

  return cell(params);
};

export default ActionCell;

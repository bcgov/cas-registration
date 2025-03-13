import { GridRenderCellParams } from "@mui/x-data-grid";
import ActionCellFactory from "@bciers/components/datagrid/cells/ActionCellFactory";
import { ComplianceSummary } from "../../compliance-summaries/types";

const ActionCell = (params: GridRenderCellParams) => {
  const cellText = params.row.obligation_id
    ? "Manage Obligation"
    : "View Details";

  const cell = ActionCellFactory({
    generateHref: (p: { row: ComplianceSummary }) =>
      `/compliance-summaries/${p.row.id}`,
    cellText: cellText,
  });

  return cell(params);
};

export default ActionCell;

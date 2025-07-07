import { GridRenderCellParams } from "@mui/x-data-grid";
import ActionCellFactory from "@bciers/components/datagrid/cells/ActionCellFactory";
import { ComplianceSummary } from "@/compliance/src/app/types";
import { IssuanceStatus } from "@bciers/utils/src/enums";

interface ActionCellProps extends GridRenderCellParams<ComplianceSummary> {
  isAllowedCas?: boolean;
}

const ActionCell = (params: ActionCellProps) => {
  const {
    obligation_id: obligationId,
    status,
    issuance_status: issuanceStatus,
    id,
  } = params.row;
  let basePath = `/compliance-summaries/${id}`;
  let cellText = "View Details";

  // if we have obligationId should show the Manage Obligation text in the cell
  if (obligationId && !params.isAllowedCas) {
    cellText = "Manage Obligation";
    basePath += "/manage-obligation-review-summary";
  } else if (status === "Earned credits") {
    const hasFinalDecision = [
      IssuanceStatus.APPROVED,
      IssuanceStatus.DECLINED,
    ].includes(issuanceStatus as IssuanceStatus);
    const isIssuanceRequested =
      issuanceStatus === IssuanceStatus.ISSUANCE_REQUESTED;

    // for internal user: if was made final decision show View Details,
    // else show Review Credits Issuance Request
    if (params.isAllowedCas) {
      if (hasFinalDecision) {
        cellText = "View Details";
        basePath += "/review-summary";
      } else {
        cellText = "Review Credits Issuance Request";
        basePath += "/request-issuance-review-summary";
      }
    } else {
      // For external users: Show "Request Issuance of Credits"
      // until request has been submitted, then "View Details"
      if (isIssuanceRequested) {
        cellText = "View Details";
        basePath += "/review-summary";
      } else {
        cellText = "Request Issuance of Credits";
        basePath += "/request-issuance-review-summary";
      }
    }
  }

  const cell = ActionCellFactory({
    generateHref: () => basePath,
    cellText,
  });

  return cell(params);
};

export default ActionCell;

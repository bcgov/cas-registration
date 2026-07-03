import { GridRenderCellParams } from "@mui/x-data-grid";
import ActionCellFactory from "@bciers/components/datagrid/cells/ActionCellFactory";
import { ComplianceSummary } from "@/compliance/src/app/types";
import {
  ComplianceSummaryStatus,
  IssuanceStatus,
  PenaltyStatus,
} from "@bciers/utils/src/enums";

export const ACTION_CELL_TEXT = {
  VIEW_DETAILS: "View Details",
  PENDING_INVOICE_CREATION: "Pending Invoice Creation",
  MANAGE_OBLIGATION: "Manage Obligation",
  REVIEW_CREDITS_ISSUANCE_REQUEST: "Review Credits Issuance Request",
  REQUEST_ISSUANCE_OF_CREDITS: "Request Issuance of Credits",
  REVIEW_CHANGE_REQUIRED: "Review Change Required",
  RESOLVE_ISSUE: "Resolve Issue",
  CONTACT_US: "Contact Us",
  ISSUE_RESOLVED: "Issue Resolved",
} as const;

interface ActionCellProps extends GridRenderCellParams<ComplianceSummary> {
  isAllowedCas?: boolean;
}

interface ActionCellConfig {
  cellText: string;
  basePath?: string;
}

// Helper functions
function obligationReportCell(
  basePath: string,
  isPenaltyAccruingOrNotPaid: boolean,
  isAllowedCas?: boolean,
  status?: string,
): ActionCellConfig {
  if (!isAllowedCas) {
    if (
      status === ComplianceSummaryStatus.OBLIGATION_PENDING_INVOICE_CREATION
    ) {
      return { cellText: ACTION_CELL_TEXT.PENDING_INVOICE_CREATION };
    } else if (
      status === ComplianceSummaryStatus.OBLIGATION_NOT_MET ||
      status === ComplianceSummaryStatus.OBLIGATION_MET_INTEREST_NOT_PAID ||
      (status === ComplianceSummaryStatus.OBLIGATION_FULLY_MET &&
        isPenaltyAccruingOrNotPaid)
    ) {
      return {
        cellText: ACTION_CELL_TEXT.MANAGE_OBLIGATION,
        basePath: `${basePath}/review-compliance-obligation-report`,
      };
    } else if (status === ComplianceSummaryStatus.OBLIGATION_FULLY_MET) {
      return {
        cellText: ACTION_CELL_TEXT.VIEW_DETAILS,
        basePath: `${basePath}/review-compliance-obligation-report`,
      };
    }
  }
  if (status === ComplianceSummaryStatus.OBLIGATION_PENDING_INVOICE_CREATION) {
    return { cellText: ACTION_CELL_TEXT.PENDING_INVOICE_CREATION };
  } else if (
    status === ComplianceSummaryStatus.OBLIGATION_NOT_MET ||
    status === ComplianceSummaryStatus.OBLIGATION_MET_INTEREST_NOT_PAID ||
    status === ComplianceSummaryStatus.OBLIGATION_FULLY_MET
  ) {
    return {
      cellText: ACTION_CELL_TEXT.VIEW_DETAILS,
      basePath: `${basePath}/review-compliance-obligation-report`,
    };
  }
  return {
    cellText: ACTION_CELL_TEXT.VIEW_DETAILS,
    basePath: `${basePath}/review-compliance-no-obligation-report`,
  };
}

function earnedCreditsCell(
  basePath: string,
  isAllowedCas?: boolean,
  issuanceStatus?: IssuanceStatus,
): ActionCellConfig {
  let cellText: string = ACTION_CELL_TEXT.VIEW_DETAILS;
  let pathSuffix = "/review-compliance-earned-credits-report";

  if (isAllowedCas && issuanceStatus === IssuanceStatus.ISSUANCE_REQUESTED) {
    cellText = ACTION_CELL_TEXT.REVIEW_CREDITS_ISSUANCE_REQUEST;
  } else if (
    !isAllowedCas &&
    issuanceStatus === IssuanceStatus.CREDITS_NOT_ISSUED
  ) {
    cellText = ACTION_CELL_TEXT.REQUEST_ISSUANCE_OF_CREDITS;
  } else if (
    !isAllowedCas &&
    issuanceStatus === IssuanceStatus.CHANGES_REQUIRED
  ) {
    cellText = ACTION_CELL_TEXT.REVIEW_CHANGE_REQUIRED;
    pathSuffix = "/request-issuance-of-earned-credits";
  }

  if (
    issuanceStatus === IssuanceStatus.APPROVED ||
    issuanceStatus === IssuanceStatus.DECLINED
  ) {
    pathSuffix = "/track-status-of-issuance";
  }

  return {
    cellText,
    basePath: `${basePath}${pathSuffix}`,
  };
}

// Main function
function getActionCellConfig(
  row: ComplianceSummary,
  isAllowedCas?: boolean,
): ActionCellConfig {
  const {
    obligation_id: obligationId,
    status,
    issuance_status: issuanceStatus,
    penalty_status: penaltyStatus,
    id,
    requires_manual_handling: requiresManualHandling,
    director_decision: directorDecision,
  } = row;

  const basePath = `/compliance-administration/compliance-summaries/${id}`;

  // Manual Handling case via directorDecision
  const resolveIssuePath = `${basePath}/resolve-issue`;

  if (directorDecision === "issue_resolved") {
    // Resolved manual-handling
    if (isAllowedCas) {
      return {
        cellText: ACTION_CELL_TEXT.VIEW_DETAILS,
        basePath: resolveIssuePath,
      };
    }

    return { cellText: ACTION_CELL_TEXT.ISSUE_RESOLVED };
  }

  if (
    directorDecision === "pending_manual_handling" ||
    requiresManualHandling
  ) {
    //  Pending manual-handling
    if (isAllowedCas) {
      return {
        cellText: ACTION_CELL_TEXT.RESOLVE_ISSUE,
        basePath: resolveIssuePath,
      };
    }

    return { cellText: ACTION_CELL_TEXT.CONTACT_US };
  }
  const isPenaltyAccruingOrNotPaid = [
    PenaltyStatus.ACCRUING,
    PenaltyStatus.NOT_PAID,
  ].some((s) => s === penaltyStatus);

  // Obligation logic
  if (obligationId) {
    return obligationReportCell(
      basePath,
      isPenaltyAccruingOrNotPaid,
      isAllowedCas,
      status,
    );
  }

  // Earned Credits logic
  if (status === ComplianceSummaryStatus.EARNED_CREDITS) {
    return earnedCreditsCell(basePath, isAllowedCas, issuanceStatus);
  }

  // Default
  return {
    cellText: ACTION_CELL_TEXT.VIEW_DETAILS,
    basePath: `${basePath}/review-compliance-no-obligation-report`,
  };
}

const ActionCell = (params: ActionCellProps) => {
  const { cellText, basePath } = getActionCellConfig(
    params.row,
    params.isAllowedCas,
  );

  if (!basePath) {
    return <span>{cellText}</span>;
  }

  const cell = ActionCellFactory({
    generateHref: () => basePath,
    cellText,
  });

  return cell(params);
};

export default ActionCell;

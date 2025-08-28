import { GridRenderCellParams } from "@mui/x-data-grid";
import ActionCellFactory from "@bciers/components/datagrid/cells/ActionCellFactory";
import { ComplianceSummary } from "@/compliance/src/app/types";
import {
  ComplianceSummaryStatus,
  IssuanceStatus,
} from "@bciers/utils/src/enums";

interface ActionCellProps extends GridRenderCellParams<ComplianceSummary> {
  isAllowedCas?: boolean;
}

function getActionCellConfig(row: ComplianceSummary, isAllowedCas?: boolean) {
  const {
    obligation_id: obligationId,
    status,
    issuance_status: issuanceStatus,
    id,
  } = row;

  const basePath = `/compliance-summaries/${id}`;

  // Obligation logic
  if (obligationId) {
    if (!isAllowedCas) {
      if (
        status === ComplianceSummaryStatus.OBLIGATION_PENDING_INVOICE_CREATION
      ) {
        return {
          cellText: "Pending Invoice Creation",
          basePath: "#",
        };
      } else if (status === ComplianceSummaryStatus.OBLIGATION_NOT_MET) {
        return {
          cellText: "Manage Obligation",
          basePath: `${basePath}/review-compliance-obligation-report`,
        };
      } else if (status === ComplianceSummaryStatus.OBLIGATION_FULLY_MET) {
        return {
          cellText: "View Details",
          basePath: `${basePath}/review-compliance-obligation-report`,
        };
      }
      return {
        cellText: "View Details",
        basePath: `${basePath}/review-summary`,
      };
    }
    if (
      status === ComplianceSummaryStatus.OBLIGATION_PENDING_INVOICE_CREATION
    ) {
      return {
        cellText: "Pending Invoice Creation",
        basePath: "#",
      };
    } else if (status === ComplianceSummaryStatus.OBLIGATION_NOT_MET) {
      return {
        cellText: "View Details",
        basePath: `${basePath}/review-compliance-obligation-report`,
      };
    }
  }

  // Earned Credits logic
  if (status === ComplianceSummaryStatus.EARNED_CREDITS) {
    let cellText = "View Details";
    let pathSuffix = "/request-issuance-review-summary";

    if (isAllowedCas && issuanceStatus === IssuanceStatus.ISSUANCE_REQUESTED) {
      cellText = "Review Credits Issuance Request";
    } else if (
      !isAllowedCas &&
      issuanceStatus === IssuanceStatus.CREDITS_NOT_ISSUED
    ) {
      cellText = "Request Issuance of Credits";
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

  // Default
  return {
    cellText: "View Details",
    basePath: `${basePath}/review-summary`,
  };
}

const ActionCell = (params: ActionCellProps) => {
  const { cellText, basePath } = getActionCellConfig(
    params.row,
    params.isAllowedCas,
  );

  const cell = ActionCellFactory({
    generateHref: () => basePath,
    cellText,
  });

  return cell(params);
};

export default ActionCell;

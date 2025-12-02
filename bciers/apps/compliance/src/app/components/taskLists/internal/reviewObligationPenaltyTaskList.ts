import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { PenaltyStatus } from "@bciers/utils/src/enums";
import { ObligationTasklistData } from "@/compliance/src/app/types";

export enum ActivePage {
  ReviewComplianceObligationReport = "ReviewComplianceObligationReport",
  ReviewInterestSummary = "ReviewInterestSummary",
  ReviewPenaltySummary = "ReviewPenaltySummary",
}

export const generateReviewObligationPenaltyTaskList: (
  complianceReportVersionId: number,
  tasklistData: ObligationTasklistData,
  activePage?: ActivePage | null,
) => TaskListElement[] = (
  complianceReportVersionId,
  tasklistData,
  activePage = ActivePage.ReviewComplianceObligationReport,
) => {
  const {
    reportingYear,
    hasLateSubmissionPenalty,
    outstandingBalance,
    penaltyStatus,
    hasOverduePenalty,
  } = tasklistData;
  const isObligationFullyPaid = Number(outstandingBalance) === 0;
  const elements: TaskListElement[] = [
    {
      type: "Page" as const,
      title: `Review ${reportingYear} Compliance Obligation Report`,
      link: `/compliance-administration/compliance-summaries/${complianceReportVersionId}/review-compliance-obligation-report`,
      isActive: activePage === ActivePage.ReviewComplianceObligationReport,
    },
  ];

  if (isObligationFullyPaid && hasLateSubmissionPenalty) {
    elements.push({
      type: "Page" as const,
      title: "Review Interest Summary",
      link: `/compliance-administration/compliance-summaries/${complianceReportVersionId}/review-interest-summary`,
      isActive: activePage === ActivePage.ReviewInterestSummary,
    });
  }
  const showPenalty =
    hasOverduePenalty &&
    isObligationFullyPaid &&
    [PenaltyStatus.NOT_PAID, PenaltyStatus.PAID].includes(
      penaltyStatus as PenaltyStatus,
    );

  if (showPenalty) {
    elements.push({
      type: "Page" as const,
      title: "Review Penalty Summary",
      link: `/compliance-administration/compliance-summaries/${complianceReportVersionId}/review-penalty-summary`,
      isActive: activePage === ActivePage.ReviewPenaltySummary,
    });
  }

  return elements;
};

import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";

export enum ActivePage {
  ReviewComplianceObligationReport = "ReviewComplianceObligationReport",
  ReviewPenaltySummary = "ReviewPenaltySummary",
}

export const generateReviewObligationPenaltyTaskList: (
  complianceReportVersionId: number,
  reportingYear: number,
  activePage?: ActivePage | null,
) => TaskListElement[] = (
  complianceReportVersionId,
  reportingYear,
  activePage = ActivePage.ReviewComplianceObligationReport,
) => {
  return [
    {
      type: "Page" as const,
      title: `Review ${reportingYear} Compliance Obligation Report`,
      link: `/compliance-summaries/${complianceReportVersionId}/review-obligation-summary`,
      isActive: activePage === ActivePage.ReviewComplianceObligationReport,
    },
    {
      type: "Page" as const,
      title: "Review Penalty Summary",
      link: `/compliance-summaries/${complianceReportVersionId}/review-penalty-summary`,
      isActive: activePage === ActivePage.ReviewPenaltySummary,
    },
  ];
};

import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { PenaltyStatus } from "@bciers/utils/src/enums";
import { ObligationTasklistData } from "@/compliance/src/app/types";

export enum ActivePage {
  ReviewComplianceObligationReport = "ReviewComplianceObligationReport",
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
  const { reportingYear, outstandingBalance, penaltyStatus } = tasklistData;
  const complianceSection = [
    {
      type: "Page" as const,
      title: `Review ${reportingYear} Compliance Obligation Report`,
      link: `/compliance-administration/compliance-summaries/${complianceReportVersionId}/review-obligation-summary`,
      isActive: activePage === ActivePage.ReviewComplianceObligationReport,
    },
  ];

  let automaticPenaltySection: TaskListElement[] = [];

  if (
    Number(outstandingBalance) === 0 &&
    (penaltyStatus === PenaltyStatus.NOT_PAID ||
      penaltyStatus === PenaltyStatus.PAID)
  ) {
    automaticPenaltySection = [
      {
        type: "Page" as const,
        title: "Review Penalty Summary",
        link: `/compliance-administration/compliance-summaries/${complianceReportVersionId}/review-penalty-summary`,
        isActive: activePage === ActivePage.ReviewPenaltySummary,
      },
    ];
  }

  return [...complianceSection, ...automaticPenaltySection];
};

import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";

export enum ActivePage {
  "ReviewComplianceSummary" = 0,
  "ApplyComplianceUnits",
  "DownloadPaymentInstructions",
  "PayObligationTrackPayments",
  "ReviewPenaltySummary",
}

export const generateManageObligationTaskList: (
  complianceSummaryId: string,
  reportingYear: number,
  defaultActiveIndex?: ActivePage,
  penaltyStatus?: string,
) => TaskListElement[] = (
  complianceSummaryId,
  reportingYear,
  defaultActiveIndex,
  penaltyStatus,
) => {
  const activeIndex = defaultActiveIndex ?? 0;
  const taskItems: TaskListElement[] = [
    activeIndex === ActivePage.ApplyComplianceUnits
      ? {
          type: "Subsection",
          title: `Review ${reportingYear} Compliance Summary`,
          link: `/compliance-summaries/${complianceSummaryId}/manage-obligation-review-summary`,
          isExpanded: true,
          elements: [
            {
              type: "Page",
              title: "Apply Compliance Units",
              link: `/compliance-summaries/${complianceSummaryId}/apply-compliance-units`,
              isActive: true,
            },
          ],
        }
      : {
          type: "Page",
          title: `Review ${reportingYear} Compliance Summary`,
          link: `/compliance-summaries/${complianceSummaryId}/manage-obligation-review-summary`,
          isActive: activeIndex === ActivePage.ReviewComplianceSummary,
        },
    {
      type: "Page",
      title: "Download Payment Instructions",
      link: `/compliance-summaries/${complianceSummaryId}/download-payment-instructions`,
      isActive: activeIndex === ActivePage.DownloadPaymentInstructions,
    },
    {
      type: "Page",
      title: "Pay Obligation and Track Payment(s)",
      link: `/compliance-summaries/${complianceSummaryId}/pay-obligation-track-payments`,
      isActive: activeIndex === ActivePage.PayObligationTrackPayments,
    },
  ];

  // Conditionally add the Review Penalty Summary page
  if (penaltyStatus === "ACCRUING") {
    taskItems.push({
      type: "Page",
      title: "Review Penalty Summary",
      link: `/compliance-summaries/${complianceSummaryId}/review-penalty-summary`,
      isActive: activeIndex === ActivePage.ReviewPenaltySummary,
    });
  }

  return [
    {
      type: "Section",
      title: `${reportingYear} Compliance Summary`,
      isExpanded: true,
      elements: taskItems,
    },
  ];
};

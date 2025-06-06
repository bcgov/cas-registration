import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";

export enum ActivePage {
  "ReviewComplianceSummary" = 0,
  "ApplyComplianceUnits",
  "DownloadPaymentInstructions",
  "PayObligationTrackPayments",
}

export const generateManageObligationTaskList: (
  complianceSummaryId: string,
  reportingYear: string,
  activeIndex?: ActivePage,
) => TaskListElement[] = (
  complianceSummaryId,
  reportingYear,
  activeIndex = 0,
) => {
  const taskItems = [
    activeIndex === ActivePage.ApplyComplianceUnits
      ? {
          type: "Subsection" as const,
          title: `Review ${reportingYear} Compliance Summary`,
          link: `/compliance-summaries/${complianceSummaryId}/manage-obligation-review-summary`,
          isExpanded: true,
          elements: [
            {
              type: "Page" as const,
              title: "Apply Compliance Units",
              link: `/compliance-summaries/${complianceSummaryId}/apply-compliance-units`,
              isActive: true,
            },
          ],
        }
      : {
          type: "Page" as const,
          title: `Review ${reportingYear} Compliance Summary`,
          link: `/compliance-summaries/${complianceSummaryId}/manage-obligation-review-summary`,
          isActive: activeIndex === ActivePage.ReviewComplianceSummary,
        },
    {
      type: "Page" as const,
      title: "Download Payment Instructions",
      link: `/compliance-summaries/${complianceSummaryId}/download-payment-instructions`,
      isActive: activeIndex === ActivePage.DownloadPaymentInstructions,
    },
    {
      type: "Page" as const,
      title: "Pay Obligation and Track Payment(s)",
      link: `/compliance-summaries/${complianceSummaryId}/pay-obligation-track-payments`,
      isActive: activeIndex === ActivePage.PayObligationTrackPayments,
    },
  ];

  return [
    {
      type: "Section",
      title: `${reportingYear} Compliance Summary`,
      isExpanded: true,
      elements: taskItems,
    },
  ];
};

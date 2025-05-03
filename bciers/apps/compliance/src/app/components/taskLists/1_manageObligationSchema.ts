import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";

export enum ActivePage {
  "ReviewComplianceSummary" = 0,
  "ApplyComplianceUnits",
  "DownloadPaymentInstructions",
  "PayObligationTrackPayments",
}

export const getComplianceSummaryTaskList: (
  complianceSummaryId: number,
  reporting_year?: number,
  activeIndex?: ActivePage,
) => TaskListElement[] = (
  complianceSummaryId,
  reporting_year,
  activeIndex = 0,
) => {
  const taskItems = [
    activeIndex === ActivePage.ApplyComplianceUnits
      ? {
          type: "Subsection" as const,
          title: `Review ${reporting_year} Compliance Summary`,
          link: `/compliance-summaries/${complianceSummaryId}/manage-obligation/review-compliance-summary`,
          isExpanded: true,
          elements: [
            {
              type: "Page" as const,
              title: "Apply Compliance Units",
              link: `/compliance-summaries/${complianceSummaryId}/manage-obligation/apply-compliance-units`,
              isActive: true,
            },
          ],
        }
      : {
          type: "Page" as const,
          title: `Review ${reporting_year} Compliance Summary`,
          link: `/compliance-summaries/${complianceSummaryId}/manage-obligation/review-compliance-summary`,
          isActive: activeIndex === ActivePage.ReviewComplianceSummary,
          // isChecked:true,
        },
    {
      type: "Page" as const,
      title: "Download Payment Instructions",
      link: `/compliance-summaries/${complianceSummaryId}/manage-obligation/download-payment-instructions`,
      isActive: activeIndex === ActivePage.DownloadPaymentInstructions,
      // isChecked:true
    },
    {
      type: "Page" as const,
      title: "Pay Obligation and Track Payment(s)",
      link: `/compliance-summaries/${complianceSummaryId}/manage-obligation/pay-obligation-track-payments`,
      isActive: activeIndex === ActivePage.PayObligationTrackPayments,
      // isChecked:false
    },
  ];

  return [
    {
      type: "Section",
      title: `${reporting_year} Compliance Summary`,
      isExpanded: true,
      elements: taskItems,
    },
  ];
};

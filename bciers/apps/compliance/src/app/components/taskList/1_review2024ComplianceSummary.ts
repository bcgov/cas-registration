import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";

export enum ActivePage {
  "ReviewComplianceSummary" = 0,
  "DownloadPaymentInstructions",
  "PayObligationTrackPayments",
}

export const getComplianceSummaryTaskList: (
  compliance_summary_id: number,
  activeIndex?: ActivePage,
  reporting_year?: number,
) => TaskListElement[] = (
  compliance_summary_id,
  reporting_year,
  activeIndex = 0,
) => {
  return [
    {
      type: "Section",
      title: `${reporting_year} Compliance Summary`,
      isExpanded: true,
      elements: [
        {
          type: "Page",
          title: `Review ${reporting_year} Compliance Summary`,
          link: `/compliance-summaries/${compliance_summary_id}/review-compliance-summary`,
          isActive: activeIndex === ActivePage.ReviewComplianceSummary,
          // isChecked:true,
        },
        {
          type: "Page",
          title: "Download Payment Instructions",
          link: `/compliance-summaries/${compliance_summary_id}/download-payment-instructions`,
          isActive: activeIndex === ActivePage.DownloadPaymentInstructions,
          // isChecked:true
        },
        {
          type: "Page",
          title: "Pay Obligation and Track Payment(s)",
          link: `/compliance-summaries/${compliance_summary_id}/pay-obligation-track-payments`,
          isActive: activeIndex === ActivePage.PayObligationTrackPayments,
          // isChecked:false
        },
      ],
    },
  ];
};

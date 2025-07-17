import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { generateManageObligationTaskList } from "./1_manageObligationTaskList";

export enum ActivePage {
  ReviewPenaltySummary = "ReviewPenaltySummary",
  DownloadPaymentPenaltyInstruction = "DownloadPaymentPenaltyInstruction",
  PayPenaltyTrackPayments = "PayPenaltyTrackPayments",
}

export const generateAutomaticOverduePenaltyTaskList: (
  complianceSummaryId: string,
  reporting_year: string,
  activePage?: ActivePage | null,
) => TaskListElement[] = (
  complianceSummaryId,
  reporting_year,
  activePage = ActivePage.ReviewPenaltySummary,
) => {
  const taskItems = [
    {
      type: "Page" as const,
      title: `Review Penalty Summary`,
      link: `/compliance-summaries/${complianceSummaryId}/review-penalty-summary`,
      isActive: activePage === ActivePage.ReviewPenaltySummary,
    },
    {
      type: "Page" as const,
      title: "Download Payment Instructions",
      link: `/compliance-summaries/${complianceSummaryId}/download-payment-penalty-instructions`,
      isActive: activePage === ActivePage.DownloadPaymentPenaltyInstruction,
    },
    {
      type: "Page" as const,
      title: "Pay Penalty and Track Payment(s)",
      link: `/compliance-summaries/${complianceSummaryId}/pay-penalty-track-payments`,
      isActive: activePage === ActivePage.PayPenaltyTrackPayments,
    },
  ];

  const complianceObligationSection = generateManageObligationTaskList(
    complianceSummaryId,
    { reporting_year },
    null,
  )[0];

  return [
    { ...complianceObligationSection, isExpanded: false },
    {
      type: "Section",
      title: `Automatic Overdue Penalty`,
      isExpanded: true,
      elements: taskItems,
    },
  ];
};

export default generateAutomaticOverduePenaltyTaskList;

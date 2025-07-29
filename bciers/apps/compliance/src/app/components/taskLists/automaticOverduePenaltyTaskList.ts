import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { generateManageObligationTaskList } from "./1_manageObligationTaskList";

export enum ActivePage {
  ReviewPenaltySummary = "ReviewPenaltySummary",
  DownloadPaymentPenaltyInstruction = "DownloadPaymentPenaltyInstruction",
  PayPenaltyTrackPayments = "PayPenaltyTrackPayments",
}

export const generateAutomaticOverduePenaltyTaskList: (
  complianceReportVersionId: number,
  reporting_year: number,
  activePage?: ActivePage | null,
) => TaskListElement[] = (
  complianceReportVersionId,
  reporting_year,
  activePage = ActivePage.ReviewPenaltySummary,
) => {
  const taskItems = [
    {
      type: "Page" as const,
      title: `Review Penalty Summary`,
      link: `/compliance-summaries/${complianceReportVersionId}/review-penalty-summary`,
      isActive: activePage === ActivePage.ReviewPenaltySummary,
    },
    // TODO: should be implemented in the task #91
    {
      type: "Page" as const,
      title: "Download Payment Instructions",
      link: `/compliance-summaries/${complianceReportVersionId}/download-payment-penalty-instructions`,
      isActive: activePage === ActivePage.DownloadPaymentPenaltyInstruction,
    },
    // TODO: should be implemented in the task #91
    {
      type: "Page" as const,
      title: "Pay Penalty and Track Payment(s)",
      link: `/compliance-summaries/${complianceReportVersionId}/pay-penalty-track-payments`,
      isActive: activePage === ActivePage.PayPenaltyTrackPayments,
    },
  ];

  const complianceObligationSection = generateManageObligationTaskList(
    complianceReportVersionId,
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

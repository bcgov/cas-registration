import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { ActivePage, penaltyPages } from "./1_manageObligationTaskList";

export const generateAutomaticOverduePenaltyTaskList: (
  complianceReportVersionId: number,
  activePage?: ActivePage | null,
) => TaskListElement[] = (complianceReportVersionId, activePage) => {
  const taskItems = [
    {
      type: "Page" as const,
      title: `Review Penalty Summary`,
      link: `/compliance-summaries/${complianceReportVersionId}/review-penalty-summary`,
      isActive: activePage === ActivePage.ReviewPenaltySummary,
    },
    {
      type: "Page" as const,
      title: "Download Payment Instructions",
      link: `/compliance-summaries/${complianceReportVersionId}/download-payment-penalty-instructions`,
      isActive: activePage === ActivePage.DownloadPaymentPenaltyInstruction,
    },
    {
      type: "Page" as const,
      title: "Pay Penalty and Track Payment(s)",
      link: `/compliance-summaries/${complianceReportVersionId}/pay-penalty-track-payments`,
      isActive: activePage === ActivePage.PayPenaltyTrackPayments,
    },
  ];

  return [
    {
      type: "Section",
      title: `Automatic Overdue Penalty`,
      isExpanded: Object.values(penaltyPages).includes(
        activePage as ActivePage,
      ),
      elements: taskItems,
    },
  ];
};

export default generateAutomaticOverduePenaltyTaskList;

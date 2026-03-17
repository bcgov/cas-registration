import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { ActivePage } from "./1_manageObligationTaskList";

export const generateGgeaparInterestTaskList: (
  complianceReportVersionId: number,
  activePage?: ActivePage | null,
) => TaskListElement[] = (complianceReportVersionId, activePage) => {
  const taskItems = [
    {
      type: "Page" as const,
      title: `Review Interest Summary`,
      link: `/compliance-administration/compliance-summaries/${complianceReportVersionId}/review-interest-summary`,
      isActive: activePage === ActivePage.ReviewInterestSummary,
    },
    {
      type: "Page" as const,
      title: "Download Payment Instructions",
      link: `/compliance-administration/compliance-summaries/${complianceReportVersionId}/download-interest-payment-instructions`,
      isActive: activePage === ActivePage.DownloadInterestPaymentInstructions,
    },
    {
      type: "Page" as const,
      title: "Pay Interest and Track Payment(s)",
      link: `/compliance-administration/compliance-summaries/${complianceReportVersionId}/pay-interest-penalty-track-payments`,
      isActive: activePage === ActivePage.PayInterestPenaltyTrackPayments,
    },
  ];

  return [
    {
      type: "Section",
      title: `GGEAPAR Interest`,
      isExpanded: true,
      elements: taskItems,
    },
  ];
};

export default generateGgeaparInterestTaskList;

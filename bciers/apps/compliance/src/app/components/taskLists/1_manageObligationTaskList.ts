import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { generateAutomaticOverduePenaltyTaskList } from "./automaticOverduePenaltyTaskList";
import { PenaltyStatus } from "@bciers/utils/src/enums";
import { ObligationTasklistData } from "@/compliance/src/app/types";

export enum ActivePage {
  ReviewComplianceSummary = "ReviewComplianceSummary",
  ApplyComplianceUnits = "ApplyComplianceUnits",
  DownloadPaymentObligationInstructions = "DownloadPaymentObligationInstructions",
  PayObligationTrackPayments = "PayObligationTrackPayments",
  ReviewPenaltySummary = "ReviewPenaltySummary",
  DownloadPaymentPenaltyInstruction = "DownloadPaymentPenaltyInstruction",
  PayPenaltyTrackPayments = "PayPenaltyTrackPayments",
}

const compliancePages = [
  ActivePage.ReviewComplianceSummary,
  ActivePage.DownloadPaymentObligationInstructions,
  ActivePage.PayObligationTrackPayments,
];

export const penaltyPages = [
  ActivePage.ReviewPenaltySummary,
  ActivePage.DownloadPaymentPenaltyInstruction,
  ActivePage.PayPenaltyTrackPayments,
];

export const generateManageObligationTaskList: (
  complianceReportVersionId: number,
  tasklistData: ObligationTasklistData,
  defaultActiveIndex?: ActivePage | null,
) => TaskListElement[] = (
  complianceReportVersionId,
  tasklistData,
  defaultActiveIndex,
) => {
  const activePage =
    defaultActiveIndex === undefined
      ? ActivePage.ReviewComplianceSummary
      : defaultActiveIndex;
  const { reportingYear, outstandingBalance, penaltyStatus } = tasklistData;

  const taskItems = [
    activePage === ActivePage.ApplyComplianceUnits
      ? {
          type: "Subsection" as const,
          title: `Review ${reportingYear} Compliance Obligation Report`,
          link: `/compliance-summaries/${complianceReportVersionId}/review-compliance-obligation-report`,
          isExpanded: true,
          elements: [
            {
              type: "Page" as const,
              title: "Apply Compliance Units",
              link: `/compliance-summaries/${complianceReportVersionId}/apply-compliance-units`,
              isActive: true,
            },
          ],
        }
      : {
          type: "Page" as const,
          title: `Review ${reportingYear} Compliance Obligation Report`,
          link: `/compliance-summaries/${complianceReportVersionId}/review-compliance-obligation-report`,
          isActive: activePage === ActivePage.ReviewComplianceSummary,
        },

    {
      type: "Page" as const,
      title: "Download Payment Instructions",
      link: `/compliance-summaries/${complianceReportVersionId}/download-payment-instructions`,
      isActive: activePage === ActivePage.DownloadPaymentObligationInstructions,
    },

    {
      type: "Page" as const,
      title: "Pay Obligation and Track Payment(s)",
      link: `/compliance-summaries/${complianceReportVersionId}/pay-obligation-track-payments`,
      isActive: activePage === ActivePage.PayObligationTrackPayments,
    },
  ];

  const complianceSection: TaskListElement[] = [
    {
      type: "Section",
      title: `${reportingYear} Compliance Summary`,
      isExpanded: compliancePages.includes(activePage as ActivePage),
      elements: taskItems,
    },
  ];

  let automaticPenaltySection: TaskListElement[] = [];

  if (
    (activePage === ActivePage.PayObligationTrackPayments ||
      penaltyPages.includes(activePage as ActivePage)) &&
    Number(outstandingBalance) === 0 &&
    (penaltyStatus === PenaltyStatus.NOT_PAID ||
      penaltyStatus === PenaltyStatus.PAID)
  ) {
    automaticPenaltySection = generateAutomaticOverduePenaltyTaskList(
      complianceReportVersionId,
      activePage,
    );
  }

  return [...complianceSection, ...automaticPenaltySection];
};

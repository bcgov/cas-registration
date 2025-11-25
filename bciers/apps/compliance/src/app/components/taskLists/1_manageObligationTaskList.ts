import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { generateAutomaticOverduePenaltyTaskList } from "./automaticOverduePenaltyTaskList";
import { generateGgeaparInterestTaskList } from "./ggeaparInterestTaskList";
import { PenaltyStatus } from "@bciers/utils/src/enums";
import { ObligationTasklistData } from "@/compliance/src/app/types";

export enum ActivePage {
  ReviewComplianceSummary = "ReviewComplianceSummary",
  ApplyComplianceUnits = "ApplyComplianceUnits",
  DownloadPaymentObligationInstructions = "DownloadPaymentObligationInstructions",
  PayObligationTrackPayments = "PayObligationTrackPayments",
  ReviewInterestSummary = "ReviewInterestSummary",
  DownloadInterestPaymentInstructions = "DownloadInterestPaymentInstructions",
  PayInterestPenaltyTrackPayments = "PayInterestPenaltyTrackPayments",
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

export const interestPages = [
  ActivePage.ReviewInterestSummary,
  ActivePage.DownloadInterestPaymentInstructions,
  ActivePage.PayInterestPenaltyTrackPayments,
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
  const {
    reportingYear,
    outstandingBalance,
    penaltyStatus,
    hasLateSubmissionPenalty,
  } = tasklistData;
  const taskItems = [
    activePage === ActivePage.ApplyComplianceUnits
      ? {
          type: "Subsection" as const,
          title: `Review ${reportingYear} Compliance Obligation Report`,
          link: `/compliance-administration/compliance-summaries/${complianceReportVersionId}/review-compliance-obligation-report`,
          isExpanded: true,
          elements: [
            {
              type: "Page" as const,
              title: "Apply Compliance Units",
              link: `/compliance-administration/compliance-summaries/${complianceReportVersionId}/apply-compliance-units`,
              isActive: true,
            },
          ],
        }
      : {
          type: "Page" as const,
          title: `Review ${reportingYear} Compliance Obligation Report`,
          link: `/compliance-administration/compliance-summaries/${complianceReportVersionId}/review-compliance-obligation-report`,
          isActive: activePage === ActivePage.ReviewComplianceSummary,
        },

    {
      type: "Page" as const,
      title: "Download Payment Instructions",
      link: `/compliance-administration/compliance-summaries/${complianceReportVersionId}/download-payment-instructions`,
      isActive: activePage === ActivePage.DownloadPaymentObligationInstructions,
    },

    {
      type: "Page" as const,
      title: "Pay Obligation and Track Payment(s)",
      link: `/compliance-administration/compliance-summaries/${complianceReportVersionId}/pay-obligation-track-payments`,
      isActive: activePage === ActivePage.PayObligationTrackPayments,
    },
  ];

  const backLink = {
    type: "Link" as const,
    text: "Back to compliance obligation report",
    title: "Back to compliance obligation report",
    link: `/compliance/compliance-administration/compliance-summaries/${complianceReportVersionId}/review-compliance-obligation-report`,
  };

  const complianceSection: TaskListElement[] = [
    ...(activePage === ActivePage.ApplyComplianceUnits ? [backLink] : []),
    {
      type: "Section",
      title: `${reportingYear} Compliance Summary`,
      isExpanded: compliancePages.includes(activePage as ActivePage),
      elements: taskItems,
    },
  ];

  let ggeaparInterestSection: TaskListElement[] = [];
  const isObligationFullyPaid = Number(outstandingBalance) === 0;

  if (isObligationFullyPaid && hasLateSubmissionPenalty) {
    ggeaparInterestSection = generateGgeaparInterestTaskList(
      complianceReportVersionId,
      activePage,
    );
  }

  let automaticPenaltySection: TaskListElement[] = [];

  if (
    isObligationFullyPaid &&
    [PenaltyStatus.NOT_PAID, PenaltyStatus.PAID].includes(
      penaltyStatus as PenaltyStatus,
    )
  ) {
    automaticPenaltySection = generateAutomaticOverduePenaltyTaskList(
      complianceReportVersionId,
      activePage,
    );
  }

  return [
    ...complianceSection,
    ...ggeaparInterestSection,
    ...automaticPenaltySection,
  ];
};

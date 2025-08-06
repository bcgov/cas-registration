import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { generateAutomaticOverduePenaltyTaskList } from "./automaticOverduePenaltyTaskList";

export enum ActivePage {
  ReviewComplianceSummary = "ReviewComplianceSummary",
  ApplyComplianceUnits = "ApplyComplianceUnits",
  DownloadPaymentObligationInstructions = "DownloadPaymentObligationInstructions",
  PayObligationTrackPayments = "PayObligationTrackPayments",
}

export const generateManageObligationTaskList: (
  complianceReportVersionId: number,
  data: any,
  defaultActiveIndex?: ActivePage | null,
) => TaskListElement[] = (
  complianceReportVersionId,
  data,
  defaultActiveIndex,
) => {
  const activePage =
    defaultActiveIndex === undefined
      ? ActivePage.ReviewComplianceSummary
      : defaultActiveIndex;
  const {
    reporting_year: reportingYear,
    outstanding_balance: outstandingBalance,
  } = data;
  const taskItems = [
    activePage === ActivePage.ApplyComplianceUnits
      ? {
          type: "Subsection" as const,
          title: `Review ${reportingYear} Compliance Summary`,
          link: `/compliance-summaries/${complianceReportVersionId}/manage-obligation-review-summary`,
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
          title: `Review ${reportingYear} Compliance Summary`,
          link: `/compliance-summaries/${complianceReportVersionId}/manage-obligation-review-summary`,
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

  const sections: TaskListElement[] = [
    {
      type: "Section",
      title: `${reportingYear} Compliance Summary`,
      isExpanded: true,
      elements: taskItems,
    },
  ];

  if (
    activePage === ActivePage.PayObligationTrackPayments &&
    Number(outstandingBalance) === 0 &&
    (data?.penalty_status === "NOT PAID" || data?.penalty_status === "PAID")
  ) {
    const automaticPenaltySection = generateAutomaticOverduePenaltyTaskList(
      complianceReportVersionId,
      data.reporting_year,
      null,
    )[1];

    sections.push({ ...automaticPenaltySection, isExpanded: false });
  }

  return sections;
};

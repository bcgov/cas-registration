import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";

export enum ActivePage {
  ReviewComplianceSummary = "ReviewComplianceSummary",
  RequestIssuanceOfEarnedCredits = "RequestIssuanceOfEarnedCredits",
  TrackStatusOfIssuance = "TrackStatusOfIssuance",
}

export const generateRequestIssuanceTaskList: (
  complianceReportVersionId: number,
  reportingYear: number,
  activePage?: string,
) => TaskListElement[] = (
  complianceReportVersionId,
  reportingYear,
  activePage = ActivePage.ReviewComplianceSummary,
) => {
  const taskItems = [
    {
      type: "Page" as const,
      title: `Review ${reportingYear} Compliance Report`,
      link: `/compliance-summaries/${complianceReportVersionId}/request-issuance-review-summary`,
      isActive: activePage === ActivePage.ReviewComplianceSummary,
    },
    {
      type: "Page" as const,
      title: "Request Issuance of Earned Credits",
      link: `/compliance-summaries/${complianceReportVersionId}/request-issuance-of-earned-credits`,
      isActive: activePage === ActivePage.RequestIssuanceOfEarnedCredits,
    },
    {
      type: "Page" as const,
      title: "Track Status of Issuance",
      link: `/compliance-summaries/${complianceReportVersionId}/track-status-of-issuance`,
      isActive: activePage === ActivePage.TrackStatusOfIssuance,
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

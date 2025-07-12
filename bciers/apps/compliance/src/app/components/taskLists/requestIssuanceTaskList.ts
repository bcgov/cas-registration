import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";

export enum ActivePage {
  ReviewComplianceSummary = "ReviewComplianceSummary",
  RequestIssuanceOfEarnedCredits = "RequestIssuanceOfEarnedCredits",
  TrackStatusOfIssuance = "TrackStatusOfIssuance",
}

export const generateRequestIssuanceTaskList: (
  complianceSummaryId: string,
  reportingYear: number,
  activePage?: string,
) => TaskListElement[] = (
  complianceSummaryId,
  reportingYear,
  activePage = ActivePage.ReviewComplianceSummary,
) => {
  const taskItems = [
    {
      type: "Page" as const,
      title: `Review ${reportingYear} Compliance Summary`,
      link: `/compliance-summaries/${complianceSummaryId}/request-issuance-review-summary`,
      isActive: activePage === ActivePage.ReviewComplianceSummary,
    },
    {
      type: "Page" as const,
      title: "Request Issuance of Earned Credits",
      link: `/compliance-summaries/${complianceSummaryId}/request-issuance-of-earned-credits`,
      isActive: activePage === ActivePage.RequestIssuanceOfEarnedCredits,
    },
    {
      type: "Page" as const,
      title: "Track Status of Issuance",
      link: `/compliance-summaries/${complianceSummaryId}/track-status-of-issuance`,
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

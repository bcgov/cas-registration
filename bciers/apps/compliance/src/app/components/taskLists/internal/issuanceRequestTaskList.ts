import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";

export enum ActivePage {
  ReviewComplianceSummary = "ReviewComplianceSummary",
  ReviewCreditsIssuanceRequest = "ReviewCreditsIssuanceRequest",
  ReviewByDirector = "ReviewByDirector",
  TrackStatusOfIssuance = "TrackStatusOfIssuance",
}

export const generateIssuanceRequestTaskList: (
  complianceSummaryId: string,
  reporting_year: number,
  activePage?: ActivePage,
) => TaskListElement[] = (
  complianceSummaryId,
  reporting_year,
  activePage = ActivePage.ReviewComplianceSummary,
) => {
  const taskItems = [
    {
      type: "Page" as const,
      title: `Review ${reporting_year} Compliance Summary`,
      link: `/compliance-summaries/${complianceSummaryId}/request-issuance-review-summary`,
      isActive: activePage === ActivePage.ReviewComplianceSummary,
    },
    {
      type: "Page" as const,
      title: "Review Credits Issuance Request",
      link: `/compliance-summaries/${complianceSummaryId}/review-credits-issuance-request`,
      isActive: activePage === ActivePage.ReviewCreditsIssuanceRequest,
    },
    {
      type: "Page" as const,
      title: "Review by Director",
      link: `/compliance-summaries/${complianceSummaryId}/review-by-director`,
      isActive: activePage === ActivePage.ReviewByDirector,
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
      title: `${reporting_year} Compliance Summary`,
      isExpanded: true,
      elements: taskItems,
    },
  ];
};

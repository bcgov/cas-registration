import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";

export enum ActivePage {
  "ReviewComplianceSummary" = 0,
  "RequestIssuanceOfEarnedCredits",
  "TrackStatusOfIssuance",
}

export const generateRequestIssuanceTaskList: (
  complianceSummaryId: string,
  reporting_year?: number,
  activeIndex?: ActivePage,
) => TaskListElement[] = (
  complianceSummaryId,
  reporting_year,
  activeIndex = 0,
) => {
  const taskItems = [
    {
      type: "Page" as const,
      title: `Review ${reporting_year} Compliance Summary`,
      link: `/compliance-summaries/${complianceSummaryId}/request-issuance-review-summary`,
      isActive: activeIndex === ActivePage.ReviewComplianceSummary,
    },
    {
      type: "Page" as const,
      title: "Request Issuance of Earned Credits",
      link: `/compliance-summaries/${complianceSummaryId}/request-issuance-of-earned-credits`,
      isActive: activeIndex === ActivePage.RequestIssuanceOfEarnedCredits,
    },
    {
      type: "Page" as const,
      title: "Track Status of Issuance",
      link: `/compliance-summaries/${complianceSummaryId}/track-status-of-issuance`,
      isActive: activeIndex === ActivePage.TrackStatusOfIssuance,
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

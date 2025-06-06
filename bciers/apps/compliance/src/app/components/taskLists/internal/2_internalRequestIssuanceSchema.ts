import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";

export enum InternalActivePage {
  "ReviewComplianceSummary" = 0,
  "AnalystReview",
  "DirectorReview",
  "TrackStatusOfIssuance",
}

export const getInternalRequestIssuanceTaskList: (
  complianceSummaryId: string,
  reporting_year?: number,
  activeIndex?: InternalActivePage,
) => TaskListElement[] = (
  complianceSummaryId,
  reporting_year,
  activeIndex = 0,
) => {
  const taskItems = [
    {
      type: "Page" as const,
      title: `Review ${reporting_year} Compliance Summary`,
      link: `/compliance-summaries/${complianceSummaryId}/review-compliance-summary`,
      isActive: activeIndex === InternalActivePage.ReviewComplianceSummary,
    },
    {
      type: "Page" as const,
      title: "Review Credits Issuance Request",
      link: `/compliance-summaries/${complianceSummaryId}/review-credits-issuance-request`,
      isActive: activeIndex === InternalActivePage.AnalystReview,
    },
    {
      type: "Page" as const,
      title: "Review by Director",
      link: `/compliance-summaries/${complianceSummaryId}/review-by-director`,
      isActive: activeIndex === InternalActivePage.DirectorReview,
    },
    {
      type: "Page" as const,
      title: "Track Status of Issuance",
      link: `/compliance-summaries/${complianceSummaryId}/track-status-of-issuance`,
      isActive: activeIndex === InternalActivePage.TrackStatusOfIssuance,
    },
  ];

  return [
    {
      type: "Section",
      title: `${reporting_year} Compliance Summary Review`,
      isExpanded: true,
      elements: taskItems,
    },
  ];
};

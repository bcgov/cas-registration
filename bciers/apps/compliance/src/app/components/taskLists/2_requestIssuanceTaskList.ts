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
  isCasStaff?: boolean,
) => TaskListElement[] = (
  complianceSummaryId,
  reporting_year,
  activeIndex = 0,
  isCasStaff = false,
) => {
  const taskItems = [
    {
      type: "Page" as const,
      title: `Review ${reporting_year} Compliance Summary`,
      link: `/compliance-summaries/${complianceSummaryId}/review-compliance-summary`,
      isActive: activeIndex === ActivePage.ReviewComplianceSummary,
    },
  ];

  if (isCasStaff) {
    taskItems.push(
      {
        type: "Page" as const,
        title: "Review Credits Issuance Request",
        link: `/compliance-summaries/${complianceSummaryId}/review-credits-issuance-request`,
        isActive: activeIndex === 1,
      },
      {
        type: "Page" as const,
        title: "Review by Director",
        link: `/compliance-summaries/${complianceSummaryId}/review-by-director`,
        isActive: activeIndex === 2,
      },
    );
  } else {
    taskItems.push({
      type: "Page" as const,
      title: "Request Issuance of Earned Credits",
      link: `/compliance-summaries/${complianceSummaryId}/request-issuance-of-earned-credits`,
      isActive: activeIndex === ActivePage.RequestIssuanceOfEarnedCredits,
    });
  }

  taskItems.push({
    type: "Page" as const,
    title: "Track Status of Issuance",
    link: `/compliance-summaries/${complianceSummaryId}/track-status-of-issuance`,
    isActive:
      activeIndex === (isCasStaff ? 3 : ActivePage.TrackStatusOfIssuance),
  });

  return [
    {
      type: "Section",
      title: `${reporting_year} Compliance Summary`,
      isExpanded: true,
      elements: taskItems,
    },
  ];
};

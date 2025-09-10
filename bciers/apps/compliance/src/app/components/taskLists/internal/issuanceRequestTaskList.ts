import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { IssuanceStatus } from "@bciers/utils/src/enums";

export enum ActivePage {
  ReviewComplianceSummary = "ReviewComplianceSummary",
  ReviewCreditsIssuanceRequest = "ReviewCreditsIssuanceRequest",
  ReviewByDirector = "ReviewByDirector",
  TrackStatusOfIssuance = "TrackStatusOfIssuance",
}

export const generateIssuanceRequestTaskList: (
  complianceReportVersionId: number,
  reporting_year: number,
  issuance_status: IssuanceStatus,
  activePage?: ActivePage,
) => TaskListElement[] = (
  complianceReportVersionId,
  reporting_year,
  issurance_status,
  activePage = ActivePage.ReviewComplianceSummary,
) => {
  let taskItems: TaskListElement[] = [];
  const reviewSummary = {
    type: "Page" as const,
    title: `Review ${reporting_year} Compliance Summary`,
    link: `/compliance-summaries/${complianceReportVersionId}/review-compliance-earned-credits-report`,
    isActive: activePage === ActivePage.ReviewComplianceSummary,
  };
  if (
    issurance_status === IssuanceStatus.APPROVED ||
    issurance_status === IssuanceStatus.DECLINED
  ) {
    taskItems = [
      {
        type: "Page" as const,
        title: "Track Status of Issuance",
        link: `/compliance-summaries/${complianceReportVersionId}/track-status-of-issuance`,
        isActive: activePage === ActivePage.TrackStatusOfIssuance,
      },
    ];
  } else if (issurance_status === IssuanceStatus.CREDITS_NOT_ISSUED) {
    taskItems = [reviewSummary];
  } else {
    taskItems = [
      reviewSummary,
      {
        type: "Page" as const,
        title: "Review Credits Issuance Request",
        link: `/compliance-summaries/${complianceReportVersionId}/review-credits-issuance-request`,
        isActive: activePage === ActivePage.ReviewCreditsIssuanceRequest,
      },
      {
        type: "Page" as const,
        title: "Review by Director",
        link: `/compliance-summaries/${complianceReportVersionId}/review-by-director`,
        isActive: activePage === ActivePage.ReviewByDirector,
      },
    ];
  }

  return [
    {
      type: "Section",
      title: `${reporting_year} Compliance Summary`,
      isExpanded: true,
      elements: taskItems,
    },
  ];
};

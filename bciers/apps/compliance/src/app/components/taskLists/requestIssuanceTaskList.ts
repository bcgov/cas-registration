import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { IssuanceStatus } from "@bciers/utils/src/enums";

export enum ActivePage {
  ReviewComplianceSummary = "ReviewComplianceSummary",
  RequestIssuanceOfEarnedCredits = "RequestIssuanceOfEarnedCredits",
  TrackStatusOfIssuance = "TrackStatusOfIssuance",
}

export const generateRequestIssuanceTaskList: (
  complianceReportVersionId: number,
  reportingYear: number,
  issuanceStatus: IssuanceStatus,
  activePage?: string,
) => TaskListElement[] = (
  complianceReportVersionId,
  reportingYear,
  issuanceStatus,
  activePage = ActivePage.ReviewComplianceSummary,
) => {
  let taskItems: TaskListElement[] = [];
  if (
    issuanceStatus === IssuanceStatus.ISSUANCE_REQUESTED ||
    issuanceStatus === IssuanceStatus.APPROVED ||
    issuanceStatus === IssuanceStatus.DECLINED
  ) {
    taskItems = [
      {
        type: "Page" as const,
        title: "Track Status of Issuance",
        link: `/compliance-summaries/${complianceReportVersionId}/track-status-of-issuance`,
        isActive: activePage === ActivePage.TrackStatusOfIssuance,
      },
    ];
  } else {
    taskItems = [
      {
        type: "Page" as const,
        title: `Review ${reportingYear} Compliance Report`,
        link: `/compliance-summaries/${complianceReportVersionId}/review-compliance-earned-credits-report`,
        isActive: activePage === ActivePage.ReviewComplianceSummary,
      },
      {
        type: "Page" as const,
        title: "Request Issuance of Earned Credits",
        link: `/compliance-summaries/${complianceReportVersionId}/request-issuance-of-earned-credits`,
        isActive: activePage === ActivePage.RequestIssuanceOfEarnedCredits,
      },
    ];
  }

  return [
    {
      type: "Section",
      title: `${reportingYear} Compliance Summary`,
      isExpanded: true,
      elements: taskItems,
    },
  ];
};

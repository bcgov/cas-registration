import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";

export enum ActivePage {
  ResolveIssue = "ReviewComplianceObligationReport",
}

export const generateManualHandlingTaskList: (
  complianceReportVersionId: number,
  activePage?: ActivePage | null,
) => TaskListElement[] = (
  complianceReportVersionId,
  activePage = ActivePage.ResolveIssue,
) => {
  return [
    {
      type: "Page" as const,
      title: `Resolve Issue`,
      link: `/compliance-administration/compliance-summaries/${complianceReportVersionId}/resolve-issue`,
      isActive: activePage === ActivePage.ResolveIssue,
    },
  ];
};

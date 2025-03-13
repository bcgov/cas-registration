import { ReportingPage, TaskListPageFactory } from "./types";

export const complianceSummaryPageFactories: {
  [Page in ReportingPage]?: TaskListPageFactory;
} = {
  [ReportingPage.ComplianceSummary]: (activePage, reportVersionId) => ({
    element: {
      type: "Page",
      title: "Compliance summary",
      isActive: activePage === ReportingPage.ComplianceSummary,
      link: `/reports/${reportVersionId}/compliance-summary`,
    },
  }),
};
